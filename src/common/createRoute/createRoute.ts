import { ParamType, SearchParamType, StateParamType } from "../types/index.js";
import { Merge, Readable, ErrorMessage } from "./helpers.js";

type RouteWithChildren<
    TChildren,
    TPath extends string,
    TPathTypes,
    TSearchTypes,
    THash extends string,
    TStateTypes
> = DecoratedChildren<TChildren, TPath, TPathTypes, TSearchTypes, THash, TStateTypes> &
    Route<TPath, TPathTypes, TSearchTypes, THash, TStateTypes> & {
        $: DecoratedChildren<TChildren, TPath, TPathTypes, TSearchTypes, THash, TStateTypes, true>;
    };

type DecoratedChildren<
    TChildren,
    TPath extends string,
    TPathTypes,
    TSearchTypes,
    THash extends string,
    TStateTypes,
    TExcludePath extends boolean = false
> = {
    [TKey in keyof TChildren]: TChildren[TKey] extends RouteWithChildren<
        infer TChildChildren,
        infer TChildPath,
        infer TChildPathTypes,
        infer TChildSearchTypes,
        infer TChildHash,
        infer TChildStateTypes
    >
        ? RouteWithChildren<
              TChildChildren,
              TExcludePath extends true
                  ? TChildPath
                  : TPath extends ""
                  ? TChildPath
                  : TChildPath extends ""
                  ? TPath
                  : `${TPath}/${TChildPath}`,
              TExcludePath extends true ? TChildPathTypes : Merge<TPathTypes, TChildPathTypes>,
              Merge<TSearchTypes, TChildSearchTypes>,
              THash | TChildHash,
              Merge<TStateTypes, TChildStateTypes>
          >
        : TChildren[TKey];
};

interface Route<
    TPath extends string = string,
    TPathTypes = Partial<Record<string, ParamType<any>>>,
    TSearchTypes = Partial<Record<string, SearchParamType<any>>>,
    THash extends string = any,
    TStateTypes = Partial<Record<string, StateParamType<any>>>
> {
    path: `/${SanitizedPath<TPath>}`;
    relativePath: PathWithoutIntermediateStars<SanitizedPath<TPath>>;
    getPlainParams: (params: InParams<TPath, TPathTypes>) => Record<string, string | undefined>;
    getPlainSearchParams: (params: InSearchParams<TSearchTypes>) => Record<string, string | string[]>;
    getTypedParams: (params: Record<string, string | undefined>) => OutParams<TPath, TPathTypes>;
    getTypedSearchParams: (searchParams: URLSearchParams) => OutSearchParams<TSearchTypes>;
    getTypedHash: (hash: string) => THash | undefined;
    getTypedState: (state: unknown) => OutStateParams<TStateTypes>;
    getUntypedParams: (params: Record<string, string | undefined>) => Record<string, string | undefined>;
    getUntypedSearchParams: (searchParams: URLSearchParams) => URLSearchParams;
    getUntypedState: (state: unknown) => Record<string, unknown>;
    buildPath: (
        params: InParams<TPath, TPathTypes>,
        searchParams?: InSearchParams<TSearchTypes>,
        hash?: THash
    ) => string;
    buildRelativePath: (
        params: InParams<TPath, TPathTypes>,
        searchParams?: InSearchParams<TSearchTypes>,
        hash?: THash
    ) => string;
    buildSearch: (params: InSearchParams<TSearchTypes>) => string;
    buildHash: (hash: THash) => string;
    buildState: (state: InStateParams<TStateTypes>) => Record<string, unknown>;
    params: TPathTypes;
    searchParams: TSearchTypes;
    hash: readonly THash[];
    state: TStateTypes;
}

type InParams<TPath extends string, TPathTypes> = [
    PathParam<SanitizedPath<PathWithoutIntermediateStars<TPath>>>
] extends [never]
    ? Record<string, never>
    : Readable<
          PartialByKey<
              PickWithFallback<
                  RawParams<TPathTypes, "in">,
                  PathParam<SanitizedPath<PathWithoutIntermediateStars<TPath>>>,
                  string
              >,
              EnsureExtends<
                  PathParam<SanitizedPath<PathWithoutIntermediateStars<TPath>>, "optional", "in">,
                  PathParam<SanitizedPath<PathWithoutIntermediateStars<TPath>>>
              >
          >
      >;

type EnsureExtends<TFirst, TSecond> = TFirst extends TSecond ? TFirst : never;

type OutParams<TPath extends string, TPathTypes> = Readable<
    OutParamsByKey<PathParam<SanitizedPath<TPath>>, PathParam<SanitizedPath<TPath>, "optional">, TPathTypes>
>;

type OutParamsByKey<TKey extends string, TOptionalKey extends string, TPathTypes> = RawParams<TPathTypes, "out"> &
    PartialByKey<
        Record<Exclude<TKey, keyof TPathTypes>, string>,
        EnsureExtends<Exclude<TOptionalKey, keyof TPathTypes>, Exclude<TKey, keyof TPathTypes>>
    >;

type InSearchParams<TSearchTypes> = [keyof TSearchTypes] extends [never]
    ? Record<string, never>
    : Readable<Partial<RawSearchParams<TSearchTypes, "in">>>;

type OutSearchParams<TSearchTypes> = Readable<RawSearchParams<TSearchTypes, "out">>;

type InStateParams<TStateTypes> = [keyof TStateTypes] extends [never]
    ? Record<string, never>
    : Readable<Partial<RawStateParams<TStateTypes, "in">>>;

type OutStateParams<TStateTypes> = Readable<RawStateParams<TStateTypes, "out">>;

type RawParams<TTypes, TMode extends "in" | "out"> = {
    [TKey in keyof TTypes]: RawParam<TTypes[TKey], TMode>;
};

type RawParam<TType, TMode extends "in" | "out"> = TType extends ParamType<infer TOut, infer TIn>
    ? TMode extends "in"
        ? Exclude<TIn, undefined>
        : TOut
    : never;

type RawSearchParams<TTypes, TMode extends "in" | "out"> = {
    [TKey in keyof TTypes]: RawSearchParam<TTypes[TKey], TMode>;
};

type RawSearchParam<TType, TMode extends "in" | "out"> = TType extends SearchParamType<infer TOut, infer TIn>
    ? TMode extends "in"
        ? Exclude<TIn, undefined>
        : TOut
    : never;

type RawStateParams<TTypes, TMode extends "in" | "out"> = {
    [TKey in keyof TTypes]: RawStateParam<TTypes[TKey], TMode>;
};

type RawStateParam<TType, TMode extends "in" | "out"> = TType extends StateParamType<infer TOut, infer TIn>
    ? TMode extends "in"
        ? Exclude<TIn, undefined>
        : TOut
    : never;

type PickWithFallback<T, K extends string, F> = { [P in K]: P extends keyof T ? T[P] : F };

type PartialByKey<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type SanitizedPath<T> = T extends `/${string}`
    ? ErrorMessage<"Leading slashes are forbidden">
    : T extends `${string}/`
    ? ErrorMessage<"Trailing slashes are forbidden">
    : T;

type PathWithoutIntermediateStars<T extends string> = T extends `${infer TStart}*?/${infer TEnd}`
    ? PathWithoutIntermediateStars<`${TStart}${TEnd}`>
    : T extends `${infer TStart}*/${infer TEnd}`
    ? PathWithoutIntermediateStars<`${TStart}${TEnd}`>
    : T;

type SanitizedChildren<T> = T extends Record<infer TKey, unknown>
    ? TKey extends string
        ? TKey extends Capitalize<TKey>
            ? T
            : ErrorMessage<"Child routes have to start with an uppercase letter">
        : T
    : T;

type SanitizedPathParam<
    TRawParam extends string,
    TKind extends "all" | "optional" = "all",
    TMode extends "in" | "out" = "out"
> = TRawParam extends `${infer TParam}?`
    ? TParam
    : TKind extends "optional"
    ? TRawParam extends "*"
        ? TMode extends "in"
            ? TRawParam
            : never
        : never
    : TRawParam;

type PathParam<
    TPath extends string,
    TKind extends "all" | "optional" = "all",
    TMode extends "in" | "out" = "out"
> = string extends TPath
    ? never
    : TPath extends `${infer TBefore}*?${infer TAfter}`
    ? SanitizedPathParam<"*?", TKind, TMode> | PathParam<TBefore, TKind, TMode> | PathParam<TAfter, TKind, TMode>
    : TPath extends `${infer TBefore}*${infer TAfter}`
    ? SanitizedPathParam<"*", TKind, TMode> | PathParam<TBefore, TKind, TMode> | PathParam<TAfter, TKind, TMode>
    : TPath extends `${infer TStart}:${infer TParam}/${infer TRest}`
    ? SanitizedPathParam<TParam, TKind, TMode> | PathParam<TRest, TKind, TMode>
    : TPath extends `${infer TStart}:${infer TParam}`
    ? SanitizedPathParam<TParam, TKind, TMode>
    : never;

interface RouteOptions {
    createSearchParams: (init?: Record<string, string | string[]> | URLSearchParams) => URLSearchParams;
    generatePath: (path: string, params?: Record<string, string | undefined>) => string;
}

interface RouteTypes<TPathTypes = any, TSearchTypes = any, THash extends string = string, TStateTypes = any> {
    params?: TPathTypes;
    searchParams?: TSearchTypes;
    hash?: ReadonlyArray<THash>;
    state?: TStateTypes;
}

type NormalizedTypes<T> = T extends RouteTypes<infer TPathTypes, infer TSearchTypes, infer THash, infer TState>
    ? RouteTypes<
          unknown extends TPathTypes ? Record<never, never> : TPathTypes,
          unknown extends TSearchTypes ? Record<never, never> : TSearchTypes,
          string extends THash ? never : THash,
          unknown extends TState ? Record<never, never> : TState
      >
    : never;

type MergeTypesArray<T extends readonly unknown[]> = T extends readonly [infer TFirst, infer TSecond, ...infer TRest]
    ? MergeTypesArray<[MergeTypesArrayItems<NormalizedTypes<TFirst>, NormalizedTypes<TSecond>>, ...TRest]>
    : T extends readonly [infer TFirst]
    ? NormalizedTypes<TFirst>
    : never;

type MergeTypesArrayItems<T, U> = T extends RouteTypes<infer TPathTypes, infer TSearchTypes, infer THash, infer TState>
    ? U extends RouteTypes<infer TChildPathTypes, infer TChildSearchTypes, infer TChildHash, infer TChildState>
        ? RouteTypes<
              Merge<TPathTypes, TChildPathTypes>,
              Merge<TSearchTypes, TChildSearchTypes>,
              TChildHash | THash,
              Merge<TState, TChildState>
          >
        : never
    : never;

type ResolvedPathTypes<T> = T extends RouteTypes<infer TPathTypes, any, any, any> ? TPathTypes : never;
type ResolvedSearchTypes<T> = T extends RouteTypes<any, infer TSearchTypes, any, any> ? TSearchTypes : never;
type ResolvedStateTypes<T> = T extends RouteTypes<any, any, any, infer TStateTypes> ? TStateTypes : never;
type ResolvedHash<T> = T extends RouteTypes<any, any, infer THash, any> ? THash : never;

function createRoute(creatorOptions: RouteOptions) {
    function route<
        TChildren = void,
        TPath extends string = string,
        TTypes extends readonly RouteTypes[] | RouteTypes = {},
        TResolvedTypes extends RouteTypes = TTypes extends readonly unknown[]
            ? MergeTypesArray<TTypes>
            : NormalizedTypes<TTypes>
    >(
        path: SanitizedPath<TPath>,
        types: TTypes = {} as TTypes,
        children?: SanitizedChildren<TChildren>
    ): RouteWithChildren<
        TChildren,
        TPath,
        ResolvedPathTypes<TResolvedTypes>,
        ResolvedSearchTypes<TResolvedTypes>,
        ResolvedHash<TResolvedTypes>,
        ResolvedStateTypes<TResolvedTypes>
    > {
        const resolvedTypes = (Array.isArray(types) ? mergeTypes(...types) : types) as unknown as TResolvedTypes;

        return {
            ...decorateChildren(path, resolvedTypes, creatorOptions, children, false),
            ...getRoute(path, resolvedTypes, creatorOptions),
            $: decorateChildren(path, resolvedTypes, creatorOptions, children, true),
        } as unknown as RouteWithChildren<
            TChildren,
            TPath,
            ResolvedPathTypes<TResolvedTypes>,
            ResolvedSearchTypes<TResolvedTypes>,
            ResolvedHash<TResolvedTypes>,
            ResolvedStateTypes<TResolvedTypes>
        >;
    }

    return route;
}

function mergeTypes<T extends readonly RouteTypes[]>(...arr: T): MergeTypesArray<T> {
    return arr.reduce((acc, item) => {
        return {
            params: { ...acc.params, ...item.params },
            searchParams: { ...acc.searchParams, ...item.searchParams },
            hash: [...(acc.hash || []), ...(item.hash || [])],
            state: { ...acc.state, ...item.state },
        };
    }, {}) as MergeTypesArray<T>;
}

function decorateChildren<
    TPath extends string,
    TPathTypes,
    TSearchTypes,
    THash extends string,
    TStateTypes,
    TChildren,
    TExcludePath extends boolean
>(
    path: SanitizedPath<TPath>,
    typesObj: RouteTypes<TPathTypes, TSearchTypes, THash, TStateTypes>,
    creatorOptions: RouteOptions,
    children: TChildren | undefined,
    excludePath: TExcludePath
): DecoratedChildren<TChildren, TPath, TPathTypes, TSearchTypes, THash, TStateTypes, TExcludePath> {
    const result: Record<string, unknown> = {};

    if (children) {
        Object.keys(children).forEach((key) => {
            const value = children[key as keyof typeof children];

            result[key] = isRoute(value)
                ? {
                      ...decorateChildren(path, typesObj, creatorOptions, value, excludePath),
                      ...getRoute(
                          excludePath || path === ""
                              ? value.path.substring(1)
                              : value.path === "/"
                              ? path
                              : `${path}${value.path}`,
                          mergeTypes(excludePath ? { ...typesObj, params: undefined } : typesObj, value),
                          creatorOptions
                      ),
                      $: decorateChildren(path, typesObj, creatorOptions, value.$, true),
                  }
                : value;
        });
    }

    return result as DecoratedChildren<TChildren, TPath, TPathTypes, TSearchTypes, THash, TStateTypes, TExcludePath>;
}

function getRoute<
    TPath extends string,
    /* eslint-disable @typescript-eslint/no-explicit-any */
    TPathTypes extends Partial<Record<PathParam<SanitizedPath<TPath>>, ParamType<unknown, never>>> = Record<
        never,
        never
    >,
    TSearchTypes extends Partial<Record<string, SearchParamType<unknown, never>>> = Record<never, never>,
    TStateTypes extends Partial<Record<string, StateParamType<unknown, never>>> = Record<never, never>,
    THash extends string = never
    /* eslint-enable */
>(
    path: SanitizedPath<TPath>,
    types: RouteTypes<TPathTypes, TSearchTypes, THash, TStateTypes>,
    creatorOptions: RouteOptions
): Route<TPath, TPathTypes, TSearchTypes, THash, TStateTypes> {
    const keys = getKeys(path);
    const relativePath = removeIntermediateStars(path);

    function getPlainParams(params: InParams<TPath, TPathTypes>) {
        return getPlainParamsByTypes(keys, params, types.params);
    }

    function getPlainSearchParams(params: InSearchParams<TSearchTypes>) {
        return getPlainSearchParamsByTypes(params, types.searchParams);
    }

    function buildRelativePathname(params: InParams<TPath, TPathTypes>) {
        const rawBuiltPath = creatorOptions.generatePath(relativePath, getPlainParams(params));

        return rawBuiltPath.startsWith("/") ? rawBuiltPath.substring(1) : rawBuiltPath;
    }

    function buildSearch(params: InSearchParams<TSearchTypes>) {
        const searchString = creatorOptions.createSearchParams(getPlainSearchParams(params)).toString();

        return searchString ? `?${searchString}` : "";
    }

    function buildHash(hash: THash) {
        return `#${hash}`;
    }

    function buildState(params: InStateParams<TStateTypes>) {
        return getPlainStateParamsByTypes(params, types.state);
    }

    function buildRelativePath(
        params: InParams<TPath, TPathTypes>,
        searchParams?: InSearchParams<TSearchTypes>,
        hash?: THash
    ) {
        return `${buildRelativePathname(params)}${searchParams !== undefined ? buildSearch(searchParams) : ""}${
            hash !== undefined ? buildHash(hash) : ""
        }`;
    }

    function buildPath(params: InParams<TPath, TPathTypes>, searchParams?: InSearchParams<TSearchTypes>, hash?: THash) {
        return `/${buildRelativePath(params, searchParams, hash)}`;
    }

    function getTypedParams(params: Record<string, string | undefined>) {
        return getTypedParamsByTypes(keys, params, types.params);
    }

    function getUntypedParams(params: Record<string, string | undefined>) {
        const result: Record<string, string | undefined> = {};

        const typedKeys: string[] = keys[0];

        Object.keys(params).forEach((key) => {
            if (typedKeys.indexOf(key) === -1) {
                result[key] = params[key];
            }
        });

        return result;
    }

    function getTypedSearchParams(params: URLSearchParams) {
        return getTypedSearchParamsByTypes(params, types.searchParams);
    }

    function getUntypedSearchParams(params: URLSearchParams) {
        const result = creatorOptions.createSearchParams(params);

        if (!types.searchParams) return result;

        Object.keys(types.searchParams).forEach((key) => {
            result.delete(key);
        });

        return result;
    }

    function getTypedState(state: unknown) {
        return getTypedStateByTypes(state, types.state);
    }

    function getUntypedState(state: unknown) {
        const result: Record<string, unknown> = {};

        if (!isRecord(state)) return result;

        const typedKeys = types.state ? Object.keys(types.state) : [];

        Object.keys(state).forEach((key) => {
            if (typedKeys.indexOf(key) === -1) {
                result[key] = state[key];
            }
        });

        return result;
    }

    function getTypedHash(hash: string) {
        return getTypedHashByValues(hash, types.hash);
    }

    return {
        path: `/${path}`,
        relativePath,
        buildPath,
        buildRelativePath,
        buildSearch,
        buildHash,
        buildState,
        getTypedParams,
        getTypedSearchParams,
        getTypedHash,
        getTypedState,
        getUntypedParams,
        getUntypedSearchParams,
        getUntypedState,
        getPlainParams,
        getPlainSearchParams,
        params: types.params ?? ({} as TPathTypes),
        searchParams: types.searchParams ?? ({} as TSearchTypes),
        hash: types.hash ?? ([] as readonly THash[]),
        state: types.state ?? ({} as TStateTypes),
    };
}

function getPlainParamsByTypes(
    keys: [string[], string[]],
    params: Record<string, unknown>,
    types?: Partial<Record<string, ParamType<unknown, never>>>
): Record<string, string> {
    const result: Record<string, string> = {};

    Object.keys(params).forEach((key) => {
        const type = types?.[key];
        const value = params[key];

        if (type && keys[0].indexOf(key) !== -1 && value !== undefined) {
            result[key] = type.getPlainParam(value as never);
        } else if (typeof value === "string") {
            result[key] = value;
        }
    });

    return result;
}

function getPlainSearchParamsByTypes(
    params: Record<string, unknown>,
    types?: Partial<Record<string, SearchParamType<unknown, never>>>
): Record<string, string | string[]> {
    const result: Record<string, string | string[]> = {};

    Object.keys(params).forEach((key) => {
        const type = types?.[key];

        if (type && params[key] !== undefined) {
            result[key] = type.getPlainSearchParam(params[key] as never);
        }
    });

    return result;
}

function getPlainStateParamsByTypes(
    params: Record<string, unknown>,
    types?: Partial<Record<string, StateParamType<unknown, never>>>
): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    Object.keys(params).forEach((key) => {
        const type = types?.[key];
        const value = params[key];

        if (type && value !== undefined) {
            result[key] = type.getPlainStateParam(value as never);
        }
    });

    return result;
}

function getTypedParamsByTypes<
    TKey extends string,
    TOptionalKey extends string,
    TPathTypes extends Partial<Record<TKey, ParamType<unknown, never>>>
>(
    keys: [TKey[], TOptionalKey[]],
    pathParams: Record<string, string | undefined>,
    types?: TPathTypes
): OutParamsByKey<TKey, TOptionalKey, TPathTypes> {
    const result: Record<string, unknown> = {};

    keys[0].forEach((key) => {
        const type = types?.[key];

        if (type) {
            result[key] = type.getTypedParam(pathParams[key]);
        } else {
            if (typeof pathParams[key] === "string") {
                result[key] = pathParams[key];
            } else {
                if (keys[1].indexOf(key as unknown as TOptionalKey) === -1) {
                    throw new Error(
                        `Expected param ${key} to exist in the given path. Most likely you're rendering the component at a wrong path. You can make it optional or explicitly specify its type as string().`
                    );
                }
            }
        }
    });

    return result as OutParamsByKey<TKey, TOptionalKey, TPathTypes>;
}

function getTypedSearchParamsByTypes<TSearchTypes extends Partial<Record<string, SearchParamType<unknown, never>>>>(
    searchParams: URLSearchParams,
    types?: TSearchTypes
): OutSearchParams<TSearchTypes> {
    const result: Record<string, unknown> = {};

    if (types) {
        Object.keys(types).forEach((key) => {
            const type = types[key];

            if (type) {
                result[key] = type.getTypedSearchParam(searchParams.getAll(key));
            }
        });
    }

    return result as OutSearchParams<TSearchTypes>;
}

function getTypedHashByValues<THash extends string>(hash?: string, hashValues?: readonly THash[]): THash | undefined {
    const normalizedHash = hash?.substring(1, hash?.length);

    if (
        hashValues?.length === 0 ||
        (normalizedHash && hashValues && hashValues.indexOf(normalizedHash as THash) !== -1)
    ) {
        return normalizedHash as THash;
    }

    return undefined;
}

function getTypedStateByTypes<TStateTypes extends Partial<Record<string, StateParamType<unknown, never>>>>(
    state: unknown,
    types?: TStateTypes
): OutStateParams<TStateTypes> {
    const result: Record<string, unknown> = {};

    if (types && isRecord(state)) {
        Object.keys(types).forEach((key) => {
            const type = types[key];

            if (type) {
                result[key] = type.getTypedStateParam(state[key]);
            }
        });
    }

    return result as OutStateParams<TStateTypes>;
}

function getKeys<TPath extends string>(path: TPath): [PathParam<TPath>[], PathParam<TPath, "optional">[]] {
    const allParams = [];
    const optionalParams = [];

    path.split(":")
        .filter((_, index) => Boolean(index))
        .forEach((part) => {
            const rawParam = part.split("/")[0];

            if (rawParam.endsWith("?")) {
                const param = rawParam.replace("?", "");
                allParams.push(param);
                optionalParams.push(param);
            } else {
                allParams.push(rawParam);
            }
        });

    if (path.includes("*?")) {
        allParams.push("*");
        optionalParams.push("*");
    } else if (path.includes("*")) {
        allParams.push("*");
    }

    return [allParams, optionalParams] as [PathParam<TPath>[], PathParam<TPath, "optional">[]];
}

function removeIntermediateStars<TPath extends string>(path: TPath): PathWithoutIntermediateStars<TPath> {
    return path.replace(/\*\??\//g, "") as PathWithoutIntermediateStars<TPath>;
}

function isRoute(
    value: unknown
): value is RouteWithChildren<
    unknown,
    string,
    Record<never, never>,
    Record<never, never>,
    string,
    Record<never, never>
> {
    return Boolean(value && typeof value === "object" && "path" in value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === "object");
}

export {
    createRoute,
    RouteOptions,
    Route,
    RouteWithChildren,
    DecoratedChildren,
    InParams,
    OutParams,
    InSearchParams,
    OutSearchParams,
    InStateParams,
    OutStateParams,
    PathParam,
    SanitizedPath,
    SanitizedChildren,
    RouteTypes,
};
