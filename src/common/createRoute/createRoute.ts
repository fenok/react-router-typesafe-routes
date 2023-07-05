import { ParamType, SearchParamType, StateParamType, HashType } from "../types/index.js";
import { Merge, Readable, ErrorMessage } from "./helpers.js";

type Route<TPath extends string = string, TTypes extends Types = Types, TChildren = void> = DecoratedRouteMap<
    TPath,
    TTypes,
    TChildren
> &
    BaseRoute<TPath, TTypes> & {
        $: DecoratedRouteMap<TPath, TTypes, TChildren, true>;
    };

type DecoratedRouteMap<
    TPath extends string = string,
    TTypes extends Types = Types,
    TChildren = void,
    TExcludePath extends boolean = false
> = {
    [TKey in keyof TChildren]: TChildren[TKey] extends Route<infer TChildPath, infer TChildTypes, infer TChildChildren>
        ? Route<
              TExcludePath extends true
                  ? TChildPath
                  : TPath extends ""
                  ? TChildPath
                  : TChildPath extends ""
                  ? TPath
                  : `${TPath}/${TChildPath}`,
              ComposedTypesMap<[TTypes, TChildTypes], TExcludePath>,
              TChildChildren
          >
        : TChildren[TKey];
};

type BaseRoute<TPath extends string = string, TTypes extends Types = Types> = {
    path: `/${SanitizedPath<TPath>}`;
    relativePath: PathWithoutIntermediateStars<SanitizedPath<TPath>>;
    getPlainParams: (params: InParams<TPath, TTypes["params"]>) => Record<string, string | undefined>;
    getPlainSearchParams: (params: InSearchParams<TTypes["searchParams"]>) => Record<string, string | string[]>;
    getTypedParams: (params: Record<string, string | undefined>) => OutParams<TPath, TTypes["params"]>;
    getTypedSearchParams: (searchParams: URLSearchParams) => OutSearchParams<TTypes["searchParams"]>;
    getTypedHash: (hash: string) => OutHash<TTypes["hash"]>;
    getTypedState: (state: unknown) => OutStateParams<TTypes["state"]>;
    getUntypedParams: (params: Record<string, string | undefined>) => Record<string, string | undefined>;
    getUntypedSearchParams: (searchParams: URLSearchParams) => URLSearchParams;
    getUntypedState: (state: unknown) => Record<string, unknown>;
    buildPath: (
        params: InParams<TPath, TTypes["params"]>,
        searchParams?: InSearchParams<TTypes["searchParams"]>,
        hash?: InHash<TTypes["hash"]>
    ) => string;
    buildRelativePath: (
        params: InParams<TPath, TTypes["params"]>,
        searchParams?: InSearchParams<TTypes["searchParams"]>,
        hash?: InHash<TTypes["hash"]>
    ) => string;
    buildSearch: (params: InSearchParams<TTypes["searchParams"]>) => string;
    buildHash: (hash: InHash<TTypes["hash"]>) => string;
    buildState: (state: InStateParams<TTypes["state"]>) => Record<string, unknown>;
} & TTypes;

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

type InHash<THash> = RawHash<THash, "in">;

type OutHash<THash> = RawHash<THash, "out">;

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

type RawHash<THash, TMode extends "in" | "out"> = THash extends readonly string[]
    ? TMode extends "in"
        ? THash[number]
        : THash[number] | undefined
    : THash extends HashType<infer TOut, infer TIn>
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

type SanitizedRouteMap<T> = T extends Record<infer TKey, unknown>
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

interface Types<
    TPathTypes extends Record<string, ParamType<any>> = {},
    TSearchTypes extends Record<string, SearchParamType<any>> = {},
    TStateTypes extends Record<string, StateParamType<any>> = {},
    THash extends readonly string[] | HashType<any> = readonly string[] | HashType<any>
> {
    params: TPathTypes;
    searchParams: TSearchTypes;
    state: TStateTypes;
    hash: THash;
}

type RequiredTypesMap<T> = T extends Partial<Types<infer TPathTypes, infer TSearchTypes, infer TState, infer THash>>
    ? Types<
          Record<string, ParamType<any>> extends TPathTypes ? {} : TPathTypes,
          Record<string, SearchParamType<any>> extends TSearchTypes ? {} : TSearchTypes,
          Record<string, StateParamType<any>> extends TState ? {} : TState,
          readonly string[] | HashType<any> extends THash ? readonly [] : THash
      >
    : never;

type ComposedTypesMap<T, TExcludePath extends boolean = false> = T extends readonly [
    infer TFirst,
    infer TSecond,
    ...infer TRest
]
    ? ComposedTypesMap<
          [MergeTypesArrayItems<RequiredTypesMap<TFirst>, RequiredTypesMap<TSecond>, TExcludePath>, ...TRest],
          TExcludePath
      >
    : T extends readonly [infer TFirst]
    ? RequiredTypesMap<TFirst>
    : RequiredTypesMap<T>;

type MergeTypesArrayItems<T, U, TExcludePath extends boolean = false> = T extends Types<
    infer TPathTypes,
    infer TSearchTypes,
    infer TState,
    infer THash
>
    ? U extends Types<infer TChildPathTypes, infer TChildSearchTypes, infer TChildState, infer TChildHash>
        ? Types<
              TExcludePath extends true ? TChildPathTypes : Merge<TPathTypes, TChildPathTypes>,
              Merge<TSearchTypes, TChildSearchTypes>,
              Merge<TState, TChildState>,
              TChildHash extends readonly string[]
                  ? THash extends readonly string[]
                      ? [...THash, ...TChildHash]
                      : THash
                  : TChildHash
          >
        : never
    : never;

function createRoute(creatorOptions: RouteOptions) {
    function route<
        TPath extends string = string,
        const TTypes extends Partial<Types> | readonly Partial<Types>[] = {},
        TChildren = void
    >(
        path: SanitizedPath<TPath>,
        types: TTypes = {} as TTypes,
        children?: SanitizedRouteMap<TChildren>
    ): Route<TPath, ComposedTypesMap<TTypes>, TChildren> {
        const resolvedTypes = mergeTypes(types);

        return {
            ...decorateChildren(path, resolvedTypes, creatorOptions, children, false),
            ...getRoute(path, resolvedTypes, creatorOptions),
            $: decorateChildren(path, resolvedTypes, creatorOptions, children, true),
        } as Route<TPath, ComposedTypesMap<TTypes>, TChildren>;
    }

    return route;
}

function mergeTypes<T extends readonly Partial<Types>[] | Partial<Types>>(value: T): ComposedTypesMap<T> {
    const arr = (Array.isArray(value) ? value : [value]) as Partial<Types>[];

    return arr.reduce(
        (acc, item) => {
            return {
                params: { ...acc.params, ...item.params },
                searchParams: { ...acc.searchParams, ...item.searchParams },
                hash: isHashType(item.hash)
                    ? item.hash
                    : isHashType(acc.hash)
                    ? acc.hash
                    : [...(acc.hash || []), ...(item.hash || [])],
                state: { ...acc.state, ...item.state },
            };
        },
        {
            params: {},
            searchParams: {},
            hash: [],
            state: {},
        }
    ) as ComposedTypesMap<T>;
}

function isHashType<T extends HashType<any>>(value: T | readonly string[] | undefined): value is T {
    return Boolean(value) && !Array.isArray(value);
}

function decorateChildren<TPath extends string, TTypes extends Types, TChildren, TExcludePath extends boolean>(
    path: SanitizedPath<TPath>,
    typesObj: TTypes,
    creatorOptions: RouteOptions,
    children: TChildren | undefined,
    excludePath: TExcludePath
): DecoratedRouteMap<TPath, TTypes, TChildren, TExcludePath> {
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
                          mergeTypes([excludePath ? { ...typesObj, params: undefined } : typesObj, value] as const),
                          creatorOptions
                      ),
                      $: decorateChildren(path, typesObj, creatorOptions, value.$, true),
                  }
                : value;
        });
    }

    return result as DecoratedRouteMap<TPath, TTypes, TChildren, TExcludePath>;
}

function getRoute<TPath extends string, TTypes extends Types>(
    path: SanitizedPath<TPath>,
    types: TTypes,
    creatorOptions: RouteOptions
): BaseRoute<TPath, TTypes> {
    const keys = getKeys(path);
    const relativePath = removeIntermediateStars(path);

    function getPlainParams(params: InParams<TPath, TTypes["params"]>) {
        return getPlainParamsByTypes(keys, params, types.params);
    }

    function getPlainSearchParams(params: InSearchParams<TTypes["searchParams"]>) {
        return getPlainSearchParamsByTypes(params, types.searchParams);
    }

    function buildRelativePathname(params: InParams<TPath, TTypes["params"]>) {
        const rawBuiltPath = creatorOptions.generatePath(relativePath, getPlainParams(params));

        return rawBuiltPath.startsWith("/") ? rawBuiltPath.substring(1) : rawBuiltPath;
    }

    function buildSearch(params: InSearchParams<TTypes["searchParams"]>) {
        const searchString = creatorOptions.createSearchParams(getPlainSearchParams(params)).toString();

        return searchString ? `?${searchString}` : "";
    }

    function buildHash(hash: InHash<TTypes["hash"]>) {
        if (isHashType(types.hash)) {
            return `#${types.hash.getPlainHash(hash)}`;
        }
        return `#${String(hash)}`;
    }

    function buildState(params: InStateParams<TTypes["state"]>) {
        return getPlainStateParamsByTypes(params, types.state);
    }

    function buildRelativePath(
        params: InParams<TPath, TTypes["params"]>,
        searchParams?: InSearchParams<TTypes["searchParams"]>,
        hash?: InHash<TTypes["hash"]>
    ) {
        return `${buildRelativePathname(params)}${searchParams !== undefined ? buildSearch(searchParams) : ""}${
            hash !== undefined ? buildHash(hash) : ""
        }`;
    }

    function buildPath(
        params: InParams<TPath, TTypes["params"]>,
        searchParams?: InSearchParams<TTypes["searchParams"]>,
        hash?: InHash<TTypes["hash"]>
    ) {
        return `/${buildRelativePath(params, searchParams, hash)}`;
    }

    function getTypedParams(params: Record<string, string | undefined>) {
        return getTypedParamsByTypes(keys, params, types.params as TTypes["params"]);
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
        return getTypedSearchParamsByTypes(params, types.searchParams as TTypes["searchParams"]);
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
        return getTypedStateByTypes(state, types.state as TTypes["state"]);
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

    function getTypedHash(hash: string): OutHash<TTypes["hash"]> {
        const normalizedHash = hash?.substring(1, hash?.length);

        if (isHashType(types.hash)) {
            return types.hash.getTypedHash(normalizedHash);
        }

        if (normalizedHash && types.hash.indexOf(normalizedHash) !== -1) {
            return normalizedHash as OutHash<TTypes["hash"]>;
        }

        return undefined as OutHash<TTypes["hash"]>;
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
        ...types,
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

function isRoute(value: unknown): value is Route<string, Types, unknown> {
    return Boolean(value && typeof value === "object" && "path" in value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === "object");
}

export {
    createRoute,
    RouteOptions,
    BaseRoute,
    Route,
    DecoratedRouteMap,
    InParams,
    OutParams,
    InSearchParams,
    OutSearchParams,
    InStateParams,
    OutStateParams,
    InHash,
    OutHash,
    PathParam,
    SanitizedPath,
    SanitizedRouteMap,
    Types,
};
