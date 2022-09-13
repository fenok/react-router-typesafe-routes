import {
    Type,
    OriginalParams,
    RetrievedParams,
    KeysWithFallback,
    throwable,
    ThrowableFallback,
} from "../types/index.js";

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
        infer TChildQueryTypes,
        infer TChildHash,
        infer TChildStateTypes
    >
        ? RouteWithChildren<
              TChildChildren,
              TPath extends "" ? TChildPath : TChildPath extends "" ? TPath : `${TPath}/${TChildPath}`,
              TPathTypes & TChildPathTypes,
              TSearchTypes & TChildQueryTypes,
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
    getUntypedSearchParams: (searchParams: URLSearchParams) => URLSearchParams;
    getTypedHash: (hash: string) => THash[number] | undefined;
    getTypedState: (state: unknown) => OutStateParams<TStateTypes>;
    getUntypedState: (state: unknown) => Record<string, unknown>;
    buildPath: (params: InParams<TPath, TPathTypes>) => string;
    buildRelativePath: (params: InParams<TPath, TPathTypes>) => string;
    buildSearch: (params: InSearchParams<TSearchTypes>) => string;
    buildHash: (hash: THash[number]) => string;
    buildState: (state: InStateParams<TStateTypes>) => Record<string, unknown>;
    buildUrl: (
        params: InParams<TPath, TPathTypes>,
        searchParams?: InSearchParams<TSearchTypes>,
        hash?: THash[number]
    ) => string;
    buildRelativeUrl: (
        params: InParams<TPath, TPathTypes>,
        searchParams?: InSearchParams<TSearchTypes>,
        hash?: THash[number]
    ) => string;
    types: RouteTypes<TPathTypes, TSearchTypes, THash, TStateTypes>;
    __path__: TPath;
}

type InParams<TPath extends string, TPathTypes> = PartialByKey<
    PickWithFallback<OriginalParams<TPathTypes>, ExtractRouteParams<SanitizedPath<TPath>>, string>,
    "*"
>;

type OutParams<TPath extends string, TPathTypes> = OutParamsByKey<ExtractRouteParams<SanitizedPath<TPath>>, TPathTypes>;

type OutParamsByKey<TKey extends string, TPathTypes> = Partial<RetrievedParams<TPathTypes>> &
    RetrievedParams<Pick<TPathTypes, KeysWithFallback<TPathTypes>>> &
    Record<Exclude<TKey, keyof TPathTypes>, string>;

type InSearchParams<TSearchTypes> = Partial<OriginalParams<TSearchTypes>>;

type OutSearchParams<TSearchTypes> = Partial<RetrievedParams<TSearchTypes>> &
    RetrievedParams<Pick<TSearchTypes, KeysWithFallback<TSearchTypes>>>;

type InStateParams<TStateTypes> = Partial<OriginalParams<TStateTypes>>;

type OutStateParams<TStateTypes> = Partial<RetrievedParams<TStateTypes>> &
    RetrievedParams<Pick<TStateTypes, KeysWithFallback<TStateTypes>>>;

type PickWithFallback<T, K extends string, F> = { [P in K]: P extends keyof T ? T[P] : F };

type PartialByKey<T, K> = K extends keyof T ? Omit<T, K> & Partial<Pick<T, K>> : T;

type SanitizedPath<T> = T extends `/${string}` ? never : T extends `${string}/` ? never : T;

type PathWithoutIntermediateStars<T extends string> = T extends `${infer TStart}*/${infer TEnd}`
    ? PathWithoutIntermediateStars<`${TStart}${TEnd}`>
    : T;

type SanitizedChildren<T> = T extends Record<infer TKey, unknown>
    ? TKey extends string
        ? TKey extends Capitalize<TKey>
            ? T
            : never
        : T
    : T;

type ExtractRouteParams<TPath extends string> = string extends TPath
    ? never
    : TPath extends `${infer TStart}:${infer TParam}/${infer TRest}`
    ? TParam | ExtractRouteParams<TRest>
    : TPath extends `${infer TStart}:${infer TParam}`
    ? TParam
    : TPath extends `${infer TBefore}*${infer TAfter}`
    ? "*"
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
        TPathTypes extends Partial<Record<ExtractRouteParams<SanitizedPath<TPath>>, Type<any>>> = Record<never, never>,
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
                          path === "" ? value.__path__ : value.__path__ === "" ? path : `${path}/${value.__path__}`,
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
    TPathTypes extends Partial<Record<ExtractRouteParams<SanitizedPath<TPath>>, Type<any>>> = Record<never, never>,
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

    function buildRelativePath(params: InParams<TPath, TPathTypes>) {
        return creatorOptions.generatePath(relativePath, getPlainParams(params));
    }

    function buildPath(params: InParams<TPath, TPathTypes>) {
        return `/${buildRelativePath(params)}`;
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

    function buildRelativeUrl(
        params: InParams<TPath, TPathTypes>,
        searchParams?: InSearchParams<TSearchTypes>,
        hash?: THash[number]
    ) {
        return `${buildRelativePath(params)}${searchParams !== undefined ? buildSearch(searchParams) : ""}${
            hash !== undefined ? buildHash(hash) : ""
        }`;
    }

    function buildUrl(
        params: InParams<TPath, TPathTypes>,
        searchParams?: InSearchParams<TSearchTypes>,
        hash?: THash[number]
    ) {
        return `/${buildRelativeUrl(params, searchParams, hash)}`;
    }

    function getTypedParams(params: Record<string, string | undefined>) {
        return getTypedParamsByTypes(keys, params, types.params);
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
        buildUrl,
        buildRelativeUrl,
        buildPath,
        buildRelativePath,
        buildSearch,
        buildHash,
        buildState,
        getTypedParams,
        getTypedSearchParams,
        getUntypedSearchParams,
        getTypedHash,
        getTypedState,
        getUntypedState,
        getPlainParams,
        getPlainSearchParams,
        __path__: path,
        types: types,
    };
}

function getPlainParamsByTypes(
    keys: string[],
    params: Record<string, unknown>,
    types?: Partial<Record<string, Type<unknown>>>
): Record<string, string> {
    const result: Record<string, string> = {};

    Object.keys(params).forEach((key) => {
        const type = types?.[key];
        const value = params[key];

        if (type && keys.indexOf(key) !== -1 && value !== undefined) {
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

function getTypedParamsByTypes<TKey extends string, TPathTypes extends Partial<Record<TKey, Type<unknown>>>>(
    keys: TKey[],
    pathParams: Record<string, string | undefined>,
    types?: TPathTypes
): OutParamsByKey<TKey, TPathTypes> {
    const result: Record<string, unknown> = {};

    keys.forEach((key) => {
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
                throw new Error(
                    `Expected param ${key} to exist in the given path. Most likely you're rendering the component at a wrong path. As an escape hatch, you can explicitly specify its type as stringType('').`
                );
            }
        }
    });

    return result as OutParamsByKey<TKey, TPathTypes>;
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

function getKeys<TPath extends string>(path: TPath): ExtractRouteParams<TPath>[] {
    const params = path
        .split(":")
        .filter((_, index) => Boolean(index))
        .map((part) => part.split("/")[0]);

    if (path.includes("*")) {
        params.push("*");
    }

    return params as ExtractRouteParams<TPath>[];
}

function removeIntermediateStars<TPath extends string>(path: TPath): PathWithoutIntermediateStars<TPath> {
    return path.replace("*/", "") as PathWithoutIntermediateStars<TPath>;
}

function mergeHashValues<T, U>(firstHash?: T[], secondHash?: U[]): (T | U)[] | undefined {
    if (!firstHash && !secondHash) {
        return undefined;
    }

    if (firstHash?.length === 0 || secondHash?.length === 0) {
        return [];
    }

    return [...(firstHash ?? []), ...(secondHash ?? [])];
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
    return Boolean(value && typeof value === "object" && "types" in value && "__path__" in value);
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
    ExtractRouteParams,
    SanitizedPath,
    SanitizedChildren,
};
