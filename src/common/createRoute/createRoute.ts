import { ParamType, SearchParamType, StateParamType, HashType, Type, DefType, string } from "../types/index.js";

type Merge<T, U> = Readable<Omit<T, keyof U> & U>;

type Identity<T> = T;

type Readable<T> = Identity<{
    [K in keyof T]: T[K];
}>;

type ErrorMessage<T extends string> = T & { __brand: ErrorMessage<T> };

type Route<TPath extends string = string, TTypes extends Types = Types<any, any, any>, TChildren = void> = Children<
    TPath,
    TTypes,
    TChildren
> &
    BaseRoute<TPath, TTypes> & {
        $: Children<TPath, TTypes, TChildren, true>;
    };

type Children<
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

type BaseRoute<TPath extends string = string, TTypes extends Types = Types<any, any, any>> = {
    path: `/${SanitizedPath<TPath>}`;
    relativePath: PathWithoutIntermediateStars<SanitizedPath<TPath>>;
    getPlainParams: (params: InParams<TPath, TTypes["params"]>) => Record<string, string | undefined>;
    getPlainSearchParams: (params: InSearchParams<TTypes["searchParams"]>) => Record<string, string | string[]>;
    getTypedParams: (params: Record<string, string | undefined>) => OutParams<TTypes["params"]>;
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

type InParams<TPath extends string, TPathTypes> = IsAny<TPathTypes> extends true
    ? any
    : Merge<
          PickWithFallback<
              Readable<RawParams<TPathTypes, "in">>,
              PathParam<PathWithoutIntermediateStars<TPath>, "all", "in">,
              never
          >,
          Partial<
              PickWithFallback<
                  Readable<RawParams<TPathTypes, "in">>,
                  PathParam<PathWithoutIntermediateStars<TPath>, "optional", "in">,
                  never
              >
          >
      >;

type OutParams<TPathTypes> = Readable<PartialUndefined<RawParams<TPathTypes, "out">>>;

type InSearchParams<TSearchTypes> = IsAny<TSearchTypes> extends true
    ? any
    : Readable<Partial<RawSearchParams<TSearchTypes, "in">>>;

type OutSearchParams<TSearchTypes> = Readable<PartialUndefined<RawSearchParams<TSearchTypes, "out">>>;

type InStateParams<TStateTypes> = IsAny<TStateTypes> extends true
    ? any
    : Readable<Partial<RawStateParams<TStateTypes, "in">>>;

type OutStateParams<TStateTypes> = Readable<PartialUndefined<RawStateParams<TStateTypes, "out">>>;

type InHash<THash> = NeverToUndefined<RawHash<THash, "in">>;

type OutHash<THash> = NeverToUndefined<RawHash<THash, "out">>;

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

type PartialUndefined<T> = Undefined<T> & Omit<T, keyof Undefined<T>>;

type Undefined<T> = {
    [K in keyof T as undefined extends T[K] ? K : never]?: T[K];
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

type RawHash<THash, TMode extends "in" | "out"> = THash extends string[]
    ? TMode extends "in"
        ? THash[number]
        : THash[number] | undefined
    : THash extends HashType<infer TOut, infer TIn>
    ? TMode extends "in"
        ? Exclude<TIn, undefined>
        : TOut
    : never;

type NeverToUndefined<T> = [T] extends [never] ? undefined : T;

type PickWithFallback<T, K extends string, F> = { [P in K]: P extends keyof T ? T[P] : F };

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
    ? [TKey] extends [string]
        ? TKey extends Capitalize<TKey>
            ? T
            : ErrorMessage<"Route children have to start with an uppercase letter">
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

interface CreateRouteOptions {
    createSearchParams: (init?: Record<string, string | string[]> | URLSearchParams) => URLSearchParams;
    generatePath: (path: string, params?: Record<string, string | undefined>) => string;
}

type IsAny<T> = 0 extends 1 & T ? true : false;

interface Types<
    TPathTypes extends Record<string, ParamType<any>> = {},
    TSearchTypes extends Record<string, SearchParamType<any>> = {},
    TStateTypes extends Record<string, StateParamType<any>> = {},
    THash extends string[] | HashType<any> = string[] | HashType<any>
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
          string[] | HashType<any> extends THash ? [] : THash
      >
    : never;

type ComposedTypesMap<T, TExcludePath extends boolean = false> = T extends [infer TFirst, infer TSecond, ...infer TRest]
    ? ComposedTypesMap<
          [MergeTypesArrayItems<RequiredTypesMap<TFirst>, RequiredTypesMap<TSecond>, TExcludePath>, ...TRest],
          TExcludePath
      >
    : T extends [infer TFirst]
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
              TChildHash extends string[] ? (THash extends string[] ? [...THash, ...TChildHash] : THash) : TChildHash
          >
        : never
    : never;

type DefaultTypes<T extends string> = {
    params: Merge<Record<PathParam<T>, DefType<string>>, Record<PathParam<T, "optional">, Type<string>>>;
};

function getDefaultTypes<T extends string>(path: T): DefaultTypes<T> {
    const [allKeys, optionalKeys] = getKeys(path);

    const requiredKeys = allKeys.filter(
        (key) => !optionalKeys.includes(key as unknown as (typeof optionalKeys)[number])
    );

    const requiredParams = Object.fromEntries(requiredKeys.map((key) => [key, string().defined()]));
    const optionalParams = Object.fromEntries(optionalKeys.map((key) => [key, string()]));

    return {
        params: { ...requiredParams, ...optionalParams },
    } as DefaultTypes<T>;
}

function createRoute(creatorOptions: CreateRouteOptions) {
    function route<
        TPath extends string = "",
        TPathTypes extends Record<string, ParamType<any>> = {},
        TSearchTypes extends Record<string, SearchParamType<any>> = {},
        TStateTypes extends Record<string, StateParamType<any>> = {},
        THashString extends string = string,
        THash extends THashString[] | HashType<any> = [],
        TComposedTypes extends BaseRoute[] = [],
        TChildren = void
    >(opts: {
        path?: SanitizedPath<TPath>;
        compose?: [...TComposedTypes];
        params?: TPathTypes;
        searchParams?: TSearchTypes;
        state?: TStateTypes;
        hash?: THash;
        children?: SanitizedChildren<TChildren>;
    }): Route<
        TPath,
        ComposedTypesMap<[DefaultTypes<TPath>, ...TComposedTypes, Types<TPathTypes, TSearchTypes, TStateTypes, THash>]>,
        TChildren
    > {
        const path = opts.path ?? ("" as SanitizedPath<TPath>);

        const defaultTypes = getDefaultTypes(path);

        const composedTypes = opts?.compose ?? ([] as unknown as [...TComposedTypes]);

        const ownTypes = {
            params: opts?.params ?? {},
            searchParams: opts?.searchParams ?? {},
            state: opts?.state ?? {},
            hash: opts?.hash ?? [],
        } as Types<TPathTypes, TSearchTypes, TStateTypes, THash>;

        const resolvedTypes = mergeTypes([defaultTypes, ...composedTypes, ownTypes]);

        const resolvedChildren = opts.children;

        return {
            ...decorateChildren(path, resolvedTypes, creatorOptions, resolvedChildren, false),
            ...getRoute(path, resolvedTypes, creatorOptions),
            $: decorateChildren(path, resolvedTypes, creatorOptions, resolvedChildren, true),
        } as unknown as Route<
            TPath,
            ComposedTypesMap<
                [DefaultTypes<TPath>, ...TComposedTypes, Types<TPathTypes, TSearchTypes, TStateTypes, THash>]
            >,
            TChildren
        >;
    }

    return route;
}

function mergeTypes<T extends Partial<Types>[]>(value: [...T]): ComposedTypesMap<T>;
function mergeTypes<T extends Partial<Types>>(value: T): ComposedTypesMap<T>;
function mergeTypes<T extends Partial<Types>[] | Partial<Types>>(value: T): ComposedTypesMap<T>;
function mergeTypes<T extends Partial<Types>[] | Partial<Types>>(value: T): ComposedTypesMap<T> {
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

function isHashType<T extends HashType<any>>(value: T | string[] | undefined): value is T {
    return Boolean(value) && !Array.isArray(value);
}

function decorateChildren<TPath extends string, TTypes extends Types, TChildren, TExcludePath extends boolean>(
    path: SanitizedPath<TPath>,
    typesObj: TTypes,
    creatorOptions: CreateRouteOptions,
    children: TChildren | undefined,
    excludePath: TExcludePath
): Children<TPath, TTypes, TChildren, TExcludePath> {
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
                          mergeTypes([excludePath ? { ...typesObj, params: undefined } : typesObj, value]),
                          creatorOptions
                      ),
                      $: decorateChildren(path, typesObj, creatorOptions, value.$, true),
                  }
                : value;
        });
    }

    return result as Children<TPath, TTypes, TChildren, TExcludePath>;
}

function getRoute<TPath extends string, TTypes extends Types>(
    path: SanitizedPath<TPath>,
    types: TTypes,
    creatorOptions: CreateRouteOptions
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
        return getTypedParamsByTypes(params, types.params as TTypes["params"]);
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
    types: Partial<Record<string, ParamType<unknown, never>>>
): Record<string, string> {
    const result: Record<string, string> = {};

    Object.keys(params).forEach((key) => {
        const type = types[key];
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
    types: Partial<Record<string, SearchParamType<unknown, never>>>
): Record<string, string | string[]> {
    const result: Record<string, string | string[]> = {};

    Object.keys(params).forEach((key) => {
        const type = types[key];

        if (type && params[key] !== undefined) {
            result[key] = type.getPlainSearchParam(params[key] as never);
        }
    });

    return result;
}

function getPlainStateParamsByTypes(
    params: Record<string, unknown>,
    types: Partial<Record<string, StateParamType<unknown, never>>>
): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    Object.keys(params).forEach((key) => {
        const type = types[key];
        const value = params[key];

        if (type && value !== undefined) {
            result[key] = type.getPlainStateParam(value as never);
        }
    });

    return result;
}

function getTypedParamsByTypes<TPathTypes extends Partial<Record<string, ParamType<unknown, never>>>>(
    params: Record<string, string | undefined>,
    types: TPathTypes
): OutParams<TPathTypes> {
    const result: Record<string, unknown> = {};

    Object.keys(types).forEach((key) => {
        const type = types[key];

        if (type) {
            const typedSearchParam = type.getTypedParam(params[key]);
            if (typedSearchParam !== undefined) {
                result[key] = typedSearchParam;
            }
        }
    });

    return result as OutParams<TPathTypes>;
}

function getTypedSearchParamsByTypes<TSearchTypes extends Partial<Record<string, SearchParamType<unknown, never>>>>(
    searchParams: URLSearchParams,
    types: TSearchTypes
): OutSearchParams<TSearchTypes> {
    const result: Record<string, unknown> = {};

    Object.keys(types).forEach((key) => {
        const type = types[key];

        if (type) {
            const typedSearchParam = type.getTypedSearchParam(searchParams.getAll(key));
            if (typedSearchParam !== undefined) {
                result[key] = typedSearchParam;
            }
        }
    });

    return result as OutSearchParams<TSearchTypes>;
}

function getTypedStateByTypes<TStateTypes extends Partial<Record<string, StateParamType<unknown, never>>>>(
    state: unknown,
    types: TStateTypes
): OutStateParams<TStateTypes> {
    const result: Record<string, unknown> = {};

    if (isRecord(state)) {
        Object.keys(types).forEach((key) => {
            const type = types[key];

            if (type) {
                const typedStateParam = type.getTypedStateParam(state[key]);
                if (typedStateParam !== undefined) {
                    result[key] = typedStateParam;
                }
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
    CreateRouteOptions,
    Route,
    BaseRoute,
    Children,
    Types,
    PathParam,
    SanitizedPath,
    SanitizedChildren,
    InParams,
    OutParams,
    InSearchParams,
    OutSearchParams,
    InStateParams,
    OutStateParams,
    InHash,
    OutHash,
};
