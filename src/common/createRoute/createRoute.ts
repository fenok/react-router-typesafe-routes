import {
    Type,
    OriginalParams,
    RetrievedParams,
    KeysWithFallback,
    throwable,
    ThrowableFallback,
} from "../types/index.js";
import { warn } from "../warn.js";
import { mergeHashValues } from "../mergeHashValues.js";

type RouteWithChildren<
    TChildren,
    TPath extends string,
    TPathTypes,
    TSearchTypes,
    THash extends string[],
    TStateTypes
> = DecoratedChildren<TChildren, TPath, TPathTypes, TSearchTypes, THash, TStateTypes> &
    Route<TPath, TPathTypes, TSearchTypes, THash, TStateTypes> & { $: TChildren };

type DecoratedChildren<
    TChildren,
    TPath extends string,
    TPathTypes,
    TSearchTypes,
    THash extends string[],
    TStateTypes
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
              TPath extends "" ? TChildPath : TChildPath extends "" ? TPath : `${TPath}/${TChildPath}`,
              TPathTypes & TChildPathTypes,
              TSearchTypes & TChildSearchTypes,
              THash | TChildHash,
              TStateTypes & TChildStateTypes
          >
        : TChildren[TKey];
};

interface Route<TPath extends string, TPathTypes, TSearchTypes, THash extends string[], TStateTypes> {
    path: `/${TPath}`;
    relativePath: PathWithoutIntermediateStars<TPath>;
    getPlainParams: (params: InParams<TPath, TPathTypes>) => Record<string, string | undefined>;
    getPlainSearchParams: (params: InSearchParams<TSearchTypes>) => Record<string, string | string[]>;
    getTypedParams: (params: Record<string, string | undefined>) => OutParams<TPath, TPathTypes>;
    getTypedSearchParams: (searchParams: URLSearchParams) => OutSearchParams<TSearchTypes>;
    getTypedHash: (hash: string) => THash[number] | undefined;
    getTypedState: (state: unknown) => OutStateParams<TStateTypes>;
    getUntypedParams: (params: Record<string, string | undefined>) => Record<string, string | undefined>;
    getUntypedSearchParams: (searchParams: URLSearchParams) => URLSearchParams;
    getUntypedState: (state: unknown) => Record<string, unknown>;
    buildPath: (
        params: InParams<TPath, TPathTypes>,
        searchParams?: InSearchParams<TSearchTypes>,
        hash?: THash[number]
    ) => string;
    buildRelativePath: (
        params: InParams<TPath, TPathTypes>,
        searchParams?: InSearchParams<TSearchTypes>,
        hash?: THash[number]
    ) => string;
    buildSearch: (params: InSearchParams<TSearchTypes>) => string;
    buildHash: (hash: THash[number]) => string;
    buildState: (state: InStateParams<TStateTypes>) => Record<string, unknown>;
    types: RouteTypes<TPathTypes, TSearchTypes, THash, TStateTypes>;
    /** @deprecated Use buildPath instead. */
    buildUrl: (
        params: InParams<TPath, TPathTypes>,
        searchParams?: InSearchParams<TSearchTypes>,
        hash?: THash[number]
    ) => string;
    /** @deprecated Use buildRelativePath instead. */
    buildRelativeUrl: (
        params: InParams<TPath, TPathTypes>,
        searchParams?: InSearchParams<TSearchTypes>,
        hash?: THash[number]
    ) => string;
}

type InParams<TPath extends string, TPathTypes> = PartialByKey<
    PickWithFallback<OriginalParams<TPathTypes>, PathParam<SanitizedPath<PathWithoutIntermediateStars<TPath>>>, string>,
    EnsureExtends<
        PathParam<SanitizedPath<PathWithoutIntermediateStars<TPath>>, "optional", "in">,
        PathParam<SanitizedPath<PathWithoutIntermediateStars<TPath>>>
    >
>;

type EnsureExtends<TFirst, TSecond> = TFirst extends TSecond ? TFirst : never;

type OutParams<TPath extends string, TPathTypes> = OutParamsByKey<
    PathParam<SanitizedPath<TPath>>,
    PathParam<SanitizedPath<TPath>, "optional">,
    TPathTypes
>;

type OutParamsByKey<TKey extends string, TOptionalKey extends string, TPathTypes> = Partial<
    RetrievedParams<TPathTypes>
> &
    RetrievedParams<Pick<TPathTypes, KeysWithFallback<TPathTypes>>> &
    PartialByKey<
        Record<Exclude<TKey, keyof TPathTypes>, string>,
        EnsureExtends<Exclude<TOptionalKey, keyof TPathTypes>, Exclude<TKey, keyof TPathTypes>>
    >;

type InSearchParams<TSearchTypes> = Partial<OriginalParams<TSearchTypes>>;

type OutSearchParams<TSearchTypes> = Partial<RetrievedParams<TSearchTypes>> &
    RetrievedParams<Pick<TSearchTypes, KeysWithFallback<TSearchTypes>>>;

type InStateParams<TStateTypes> = Partial<OriginalParams<TStateTypes>>;

type OutStateParams<TStateTypes> = Partial<RetrievedParams<TStateTypes>> &
    RetrievedParams<Pick<TStateTypes, KeysWithFallback<TStateTypes>>>;

type PickWithFallback<T, K extends string, F> = { [P in K]: P extends keyof T ? T[P] : F };

type PartialByKey<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type SanitizedPath<T> = T extends `/${string}` ? never : T extends `${string}/` ? never : T;

type PathWithoutIntermediateStars<T extends string> = T extends `${infer TStart}*?/${infer TEnd}`
    ? PathWithoutIntermediateStars<`${TStart}${TEnd}`>
    : T extends `${infer TStart}*/${infer TEnd}`
    ? PathWithoutIntermediateStars<`${TStart}${TEnd}`>
    : T;

type SanitizedChildren<T> = T extends Record<infer TKey, unknown>
    ? TKey extends string
        ? TKey extends Capitalize<TKey>
            ? T
            : never
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

interface RouteTypes<TPathTypes, TSearchTypes, THash, TStateTypes> {
    params?: TPathTypes;
    searchParams?: TSearchTypes;
    hash?: THash;
    state?: TStateTypes;
}

interface RouteOptions {
    createSearchParams: (init?: Record<string, string | string[]> | URLSearchParams) => URLSearchParams;
    generatePath: (path: string, params?: Record<string, string | undefined>) => string;
}

const createRoute =
    (creatorOptions: RouteOptions) =>
    <
        TChildren = void,
        TPath extends string = string,
        /* eslint-disable @typescript-eslint/no-explicit-any */
        TPathTypes extends Partial<Record<PathParam<SanitizedPath<TPath>>, Type<any>>> = Record<never, never>,
        TSearchTypes extends Partial<Record<string, Type<any, string | string[]>>> = Record<never, never>,
        THash extends string[] = never[],
        TStateTypes extends Partial<Record<string, Type<any, any>>> = Record<never, never>
        /* eslint-enable */
    >(
        path: SanitizedPath<TPath>,
        types: RouteTypes<TPathTypes, TSearchTypes, THash, TStateTypes> = {},
        children?: SanitizedChildren<TChildren>
    ): RouteWithChildren<TChildren, TPath, TPathTypes, TSearchTypes, THash, TStateTypes> => {
        const decoratedChildren = decorateChildren(path, types, creatorOptions, children);

        return {
            ...decoratedChildren,
            ...getRoute(path, types, creatorOptions),
            $: children,
        } as RouteWithChildren<TChildren, TPath, TPathTypes, TSearchTypes, THash, TStateTypes>;
    };

function decorateChildren<
    TPath extends string,
    TPathTypes,
    TSearchTypes,
    THash extends string[],
    TStateTypes,
    TChildren
>(
    path: SanitizedPath<TPath>,
    types: RouteTypes<TPathTypes, TSearchTypes, THash, TStateTypes>,
    creatorOptions: RouteOptions,
    children?: TChildren
): DecoratedChildren<TChildren, TPath, TPathTypes, TSearchTypes, THash, TStateTypes> {
    const result: Record<string, unknown> = {};

    if (children) {
        Object.keys(children).forEach((key) => {
            const value = children[key as keyof typeof children];

            result[key] = isRoute(value)
                ? {
                      ...decorateChildren(path, types, creatorOptions, value),
                      ...getRoute(
                          path === "" ? value.path.substring(1) : value.path === "/" ? path : `${path}${value.path}`,
                          {
                              params: { ...types.params, ...value.types.params },
                              searchParams: {
                                  ...types.searchParams,
                                  ...value.types.searchParams,
                              },
                              hash: mergeHashValues(types.hash, value.types.hash),
                              state: {
                                  ...types.state,
                                  ...value.types.state,
                              },
                          },
                          creatorOptions
                      ),
                  }
                : value;
        });
    }

    return result as DecoratedChildren<TChildren, TPath, TPathTypes, TSearchTypes, THash, TStateTypes>;
}

function getRoute<
    TPath extends string,
    /* eslint-disable @typescript-eslint/no-explicit-any */
    TPathTypes extends Partial<Record<PathParam<SanitizedPath<TPath>>, Type<any>>> = Record<never, never>,
    TSearchTypes extends Partial<Record<string, Type<any, string | string[]>>> = Record<never, never>,
    TStateTypes extends Partial<Record<string, Type<any, any>>> = Record<never, never>,
    THash extends string[] = never[]
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
        return creatorOptions.generatePath(relativePath, getPlainParams(params));
    }

    function buildSearch(params: InSearchParams<TSearchTypes>) {
        const searchString = creatorOptions.createSearchParams(getPlainSearchParams(params)).toString();

        return searchString ? `?${searchString}` : "";
    }

    function buildHash(hash: THash[number]) {
        return `#${hash}`;
    }

    function buildState(params: InStateParams<TStateTypes>) {
        return getPlainStateParamsByTypes(params, types.state);
    }

    function buildRelativePath(
        params: InParams<TPath, TPathTypes>,
        searchParams?: InSearchParams<TSearchTypes>,
        hash?: THash[number]
    ) {
        return `${buildRelativePathname(params)}${searchParams !== undefined ? buildSearch(searchParams) : ""}${
            hash !== undefined ? buildHash(hash) : ""
        }`;
    }

    function buildRelativeUrl(
        params: InParams<TPath, TPathTypes>,
        searchParams?: InSearchParams<TSearchTypes>,
        hash?: THash[number]
    ) {
        warn("buildRelativeUrl is deprecated, use buildRelativePath instead.");
        return buildRelativePath(params, searchParams, hash);
    }

    function buildPath(
        params: InParams<TPath, TPathTypes>,
        searchParams?: InSearchParams<TSearchTypes>,
        hash?: THash[number]
    ) {
        return `/${buildRelativePath(params, searchParams, hash)}`;
    }

    function buildUrl(
        params: InParams<TPath, TPathTypes>,
        searchParams?: InSearchParams<TSearchTypes>,
        hash?: THash[number]
    ) {
        warn("buildUrl is deprecated, use buildPath instead.");
        return buildPath(params, searchParams, hash);
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
        types: types,
        buildUrl,
        buildRelativeUrl,
    };
}

function getPlainParamsByTypes(
    keys: [string[], string[]],
    params: Record<string, unknown>,
    types?: Partial<Record<string, Type<unknown>>>
): Record<string, string> {
    const result: Record<string, string> = {};

    Object.keys(params).forEach((key) => {
        const type = types?.[key];
        const value = params[key];

        if (type && keys[0].indexOf(key) !== -1 && value !== undefined) {
            result[key] = type.getPlain(value);
        } else if (typeof value === "string") {
            result[key] = value;
        }
    });

    return result;
}

function getPlainSearchParamsByTypes(
    params: Record<string, unknown>,
    types?: Partial<Record<string, Type<unknown, string | string[]>>>
): Record<string, string | string[]> {
    const result: Record<string, string | string[]> = {};

    Object.keys(params).forEach((key) => {
        const type = types?.[key];

        if (type && params[key] !== undefined) {
            result[key] = type.getPlain(params[key]);
        }
    });

    return result;
}

function getPlainStateParamsByTypes(
    params: Record<string, unknown>,
    types?: Partial<Record<string, Type<unknown, unknown>>>
): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    Object.keys(params).forEach((key) => {
        const type = types?.[key];
        const value = params[key];

        if (type && value !== undefined) {
            result[key] = type.getPlain(value);
        }
    });

    return result;
}

function getTypedParamsByTypes<
    TKey extends string,
    TOptionalKey extends string,
    TPathTypes extends Partial<Record<TKey, Type<unknown>>>
>(
    keys: [TKey[], TOptionalKey[]],
    pathParams: Record<string, string | undefined>,
    types?: TPathTypes
): OutParamsByKey<TKey, TOptionalKey, TPathTypes> {
    const result: Record<string, unknown> = {};

    keys[0].forEach((key) => {
        const type = types?.[key];

        if (type) {
            try {
                result[key] = type.getTyped(pathParams[key]);
            } catch (error) {
                if (isThrowableError(error)) {
                    throw error[0];
                }

                result[key] = undefined;
            }
        } else {
            if (typeof pathParams[key] === "string") {
                result[key] = pathParams[key];
            } else {
                if (keys[1].indexOf(key as unknown as TOptionalKey) === -1) {
                    throw new Error(
                        `Expected param ${key} to exist in the given path. Most likely you're rendering the component at a wrong path. You can make it optional or explicitly specify its type as stringType('').`
                    );
                }
            }
        }
    });

    return result as OutParamsByKey<TKey, TOptionalKey, TPathTypes>;
}

function getTypedSearchParamsByTypes<TSearchTypes extends Partial<Record<string, Type<unknown, string | string[]>>>>(
    searchParams: URLSearchParams,
    types?: TSearchTypes
): OutSearchParams<TSearchTypes> {
    const result: Record<string, unknown> = {};

    if (types) {
        Object.keys(types).forEach((key) => {
            const type = types[key];

            if (type) {
                try {
                    result[key] = type.getTyped(type.isArray ? searchParams.getAll(key) : searchParams.get(key));
                } catch (error) {
                    if (isThrowableError(error)) {
                        throw error[0];
                    }

                    result[key] = undefined;
                }
            }
        });
    }

    return result as OutSearchParams<TSearchTypes>;
}

function getTypedHashByValues(hash?: string, hashValues?: string[]): string | undefined {
    const normalizedHash = hash?.substring(1, hash?.length);

    if (hashValues?.length === 0 || (normalizedHash && hashValues && hashValues.indexOf(normalizedHash) !== -1)) {
        return normalizedHash;
    }

    return undefined;
}

function getTypedStateByTypes<TStateTypes extends Partial<Record<string, Type<unknown, unknown>>>>(
    state: unknown,
    types?: TStateTypes
): OutStateParams<TStateTypes> {
    const result: Record<string, unknown> = {};

    if (types && isRecord(state)) {
        Object.keys(types).forEach((key) => {
            const type = types[key];

            if (type) {
                try {
                    result[key] = type.getTyped(state[key]);
                } catch (error) {
                    if (isThrowableError(error)) {
                        throw error[0];
                    }

                    result[key] = undefined;
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

function isRoute(
    value: unknown
): value is RouteWithChildren<
    unknown,
    string,
    Record<never, never>,
    Record<never, never>,
    string[],
    Record<never, never>
> {
    return Boolean(value && typeof value === "object" && "types" in value && "path" in value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === "object");
}

function isThrowableError(error: unknown): error is [unknown, ThrowableFallback] {
    return Array.isArray(error) && error[1] === throwable;
}

export {
    createRoute,
    RouteOptions,
    RouteTypes,
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
};
