import { Type, OriginalParams, RetrievedParams, KeysWithFallback } from "../types";
import { generatePath } from "react-router";

type RouteWithChildren<
    TChildren,
    TPath extends string,
    TPathTypes,
    TSearchTypes,
    THash extends string[],
    TStateTypes
> = DecoratedChildren<TChildren, TPath, TPathTypes, TSearchTypes, THash, TStateTypes> &
    Route<TPath, TPathTypes, TSearchTypes, THash, TStateTypes>;

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
    getTypedSearchParams: (searchParams: URLSearchParamsLike) => OutSearchParams<TSearchTypes>;
    getTypedHash: (hash: string) => THash[number] | undefined;
    getTypedState: (state: unknown) => OutStateParams<TStateTypes>;
    buildPath: (params: InParams<TPath, TPathTypes>) => string;
    buildRelativePath: (params: InParams<TPath, TPathTypes>) => string;
    buildSearch: (params: InSearchParams<TSearchTypes>) => string;
    buildHash: (hash: THash[number]) => string;
    buildState: (state: InStateParams<TStateTypes>) => unknown;
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
    _originalOptions: RouteOptions<TPathTypes, TSearchTypes, THash, TStateTypes>;
    _originalPath: TPath;
}

interface URLSearchParamsLike {
    get(key: string): string | null;
    getAll(key: string): string[];
}

type InParams<TPath extends string, TPathTypes> = PartialByKey<
    PickWithFallback<OriginalParams<TPathTypes>, ExtractRouteParams<SanitizedPath<TPath>>, string>,
    "*"
>;

type OutParams<TPath extends string, TPathTypes> = OutParamsByKey<ExtractRouteParams<SanitizedPath<TPath>>, TPathTypes>;

type OutParamsByKey<TKey extends string, TPathTypes> = PartialByKey<
    PickWithFallback<RetrievedParams<TPathTypes>, TKey, string>,
    "*" extends keyof Omit<TPathTypes, KeysWithFallback<TPathTypes>> ? "*" : ""
>;

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

interface RouteOptions<TPathTypes, TSearchTypes, THash, TStateTypes> {
    params?: TPathTypes;
    searchParams?: TSearchTypes;
    hash?: THash;
    state?: TStateTypes;
}

interface RouteMetaOptions {
    createSearchParams: (init?: Record<string, string | string[]>) => URLSearchParamsLike;
}

const routeCreator =
    (metaOptions: RouteMetaOptions) =>
    <
        TChildren,
        TPath extends string = string,
        /* eslint-disable @typescript-eslint/no-explicit-any */
        TPathTypes extends Partial<Record<ExtractRouteParams<SanitizedPath<TPath>>, Type<any>>> = Record<never, never>,
        TSearchTypes extends Partial<Record<string, Type<any, string | string[]>>> = Record<never, never>,
        THash extends string[] = never[],
        TStateTypes extends Partial<Record<string, Type<any, any>>> = Record<never, never>
        /* eslint-enable */
    >(
        path: SanitizedPath<TPath>,
        options: RouteOptions<TPathTypes, TSearchTypes, THash, TStateTypes> = {},
        children?: SanitizedChildren<TChildren>
    ): RouteWithChildren<TChildren, TPath, TPathTypes, TSearchTypes, THash, TStateTypes> => {
        const decoratedChildren = decorateChildren(path, options, metaOptions, children);

        return {
            ...decoratedChildren,
            ...createRoute(path, options, metaOptions),
        };
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
    options: RouteOptions<TPathTypes, TSearchTypes, THash, TStateTypes>,
    metaOptions: RouteMetaOptions,
    children?: TChildren
): DecoratedChildren<TChildren, TPath, TPathTypes, TSearchTypes, THash, TStateTypes> {
    return Object.fromEntries(
        Object.entries(children ?? {}).map(([key, value]) => [
            key,
            isRoute(value)
                ? {
                      ...decorateChildren(path, options, metaOptions, value),
                      ...createRoute(
                          path === ""
                              ? value._originalPath
                              : value._originalPath === ""
                              ? path
                              : `${path}/${value._originalPath}`,
                          {
                              params: { ...options.params, ...value._originalOptions.params },
                              searchParams: {
                                  ...options.searchParams,
                                  ...value._originalOptions.searchParams,
                              },
                              hash: mergeHashValues(options.hash, value._originalOptions.hash),
                              state: {
                                  ...options.state,
                                  ...value._originalOptions.state,
                              },
                          },
                          metaOptions
                      ),
                  }
                : value,
        ])
    ) as DecoratedChildren<TChildren, TPath, TPathTypes, TSearchTypes, THash, TStateTypes>;
}

function createRoute<
    TPath extends string,
    /* eslint-disable @typescript-eslint/no-explicit-any */
    TPathTypes extends Partial<Record<ExtractRouteParams<SanitizedPath<TPath>>, Type<any>>> = Record<never, never>,
    TSearchTypes extends Partial<Record<string, Type<any, string | string[]>>> = Record<never, never>,
    TStateTypes extends Partial<Record<string, Type<any, any>>> = Record<never, never>,
    THash extends string[] = never[]
    /* eslint-enable */
>(
    path: SanitizedPath<TPath>,
    options: RouteOptions<TPathTypes, TSearchTypes, THash, TStateTypes>,
    metaOptions: RouteMetaOptions
): Route<TPath, TPathTypes, TSearchTypes, THash, TStateTypes> {
    const keys = getKeys(path);
    const relativePath = removeIntermediateStars(path);

    function getPlainParams(params: InParams<TPath, TPathTypes>) {
        return getPlainParamsByTypes(keys, params, options.params);
    }

    function getPlainSearchParams(params: InSearchParams<TSearchTypes>) {
        return getPlainSearchParamsByTypes(params, options.searchParams);
    }

    function buildRelativePath(params: InParams<TPath, TPathTypes>) {
        return generatePath(relativePath, getPlainParams(params));
    }

    function buildPath(params: InParams<TPath, TPathTypes>) {
        return `/${buildRelativePath(params)}`;
    }

    function buildSearch(params: InSearchParams<TSearchTypes>) {
        const searchString = metaOptions.createSearchParams(getPlainSearchParams(params)).toString();

        return searchString ? `?${searchString}` : "";
    }

    function buildHash(hash: THash[number]) {
        return `#${hash}`;
    }

    function buildState(params: InStateParams<TStateTypes>) {
        return getPlainStateParamsByTypes(params, options.state);
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
        return getTypedParamsByTypes(keys, params, options.params);
    }

    function getTypedSearchParams(params: URLSearchParamsLike) {
        return getTypedSearchParamsByTypes(params, options.searchParams);
    }

    function getTypedState(state: unknown) {
        return getTypedStateByTypes(state, options.state);
    }

    function getTypedHash(hash: string) {
        return getTypedHashByValues(hash, options.hash);
    }

    return {
        _originalOptions: options,
        _originalPath: path,
        relativePath,
        path: `/${path}`,
        getPlainParams,
        getPlainSearchParams,
        buildPath,
        buildRelativePath,
        buildSearch,
        buildHash,
        buildState,
        buildUrl,
        buildRelativeUrl,
        getTypedParams,
        getTypedSearchParams,
        getTypedHash,
        getTypedState,
    };
}

function getPlainParamsByTypes(
    keys: string[],
    params: Record<string, unknown>,
    types?: Partial<Record<string, Type<unknown>>>
): Record<string, string> {
    return Object.fromEntries(
        Object.entries(params)
            .map(([key, value]) => [
                key,
                keys.includes(key) && types?.[key] && value !== undefined
                    ? types[key]?.getPlain(value)
                    : typeof value === "string"
                    ? value
                    : undefined,
            ])
            .filter(([, value]) => value !== undefined)
    ) as Record<string, string>;
}

function getPlainSearchParamsByTypes(
    params: Record<string, unknown>,
    types?: Partial<Record<string, Type<unknown, string | string[]>>>
): Record<string, string | string[]> {
    return Object.fromEntries(
        Object.entries(params)
            .map(([key, value]) => [key, types?.[key] && value !== undefined ? types[key]?.getPlain(value) : undefined])
            .filter(([, value]) => value !== undefined)
    ) as Record<string, string | string[]>;
}

function getPlainStateParamsByTypes(
    params: Record<string, unknown>,
    types?: Partial<Record<string, Type<unknown, unknown>>>
): Record<string, unknown> {
    return Object.fromEntries(
        Object.entries(params)
            .map(([key, value]) => [key, types?.[key] && value !== undefined ? types[key]?.getPlain(value) : undefined])
            .filter(([, value]) => value !== undefined)
    ) as Record<string, unknown>;
}

function getTypedParamsByTypes<TKey extends string, TPathTypes extends Partial<Record<TKey, Type<unknown>>>>(
    keys: TKey[],
    pathParams: Record<string, string | undefined>,
    types?: TPathTypes
): OutParamsByKey<TKey, TPathTypes> {
    if (keys.some((key) => typeof pathParams[key] !== "string")) {
        throw new Error("Insufficient params");
    }

    const result: Record<string, unknown> = {};

    keys.forEach((key) => {
        if (types?.[key]) {
            try {
                result[key] = types[key]?.getTyped(pathParams[key]);
            } catch (error) {
                if (key !== "*") {
                    throw error;
                }
            }
        } else {
            result[key] = pathParams[key];
        }
    });

    return result as OutParamsByKey<TKey, TPathTypes>;
}

function getTypedSearchParamsByTypes<TSearchTypes extends Partial<Record<string, Type<unknown, string | string[]>>>>(
    searchParams: URLSearchParamsLike,
    types?: TSearchTypes
): OutSearchParams<TSearchTypes> {
    if (!types) {
        return {} as OutSearchParams<TSearchTypes>;
    }

    return Object.fromEntries(
        Object.entries(types)
            .map(([key, value]) => {
                let nextValue: unknown;

                try {
                    nextValue = value?.isArray
                        ? value.getTyped(searchParams.getAll(key))
                        : value?.getTyped(searchParams.get(key));
                } catch {
                    nextValue = undefined;
                }

                return [key, nextValue];
            })
            .filter(([, value]) => value !== undefined)
    ) as OutSearchParams<TSearchTypes>;
}

function getTypedHashByValues(hash?: string, hashValues?: string[]): string | undefined {
    const normalizedHash = hash?.substring(1, hash?.length);

    if (hashValues?.length === 0 || (normalizedHash && hashValues?.includes(normalizedHash))) {
        return normalizedHash;
    }

    return undefined;
}

function getTypedStateByTypes<TStateTypes extends Partial<Record<string, Type<unknown, unknown>>>>(
    state: unknown,
    types?: TStateTypes
): OutStateParams<TStateTypes> {
    if (!types || !isRecord(state)) {
        return {} as OutStateParams<TStateTypes>;
    }

    return Object.fromEntries(
        Object.entries(types)
            .map(([key, value]) => {
                let nextValue: unknown;

                try {
                    nextValue = value?.getTyped(state[key]);
                } catch {
                    nextValue = undefined;
                }

                return [key, nextValue];
            })
            .filter(([, value]) => value !== undefined)
    ) as OutStateParams<TStateTypes>;
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
    return Boolean(value && typeof value === "object" && "_originalOptions" in value && "_originalPath" in value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === "object");
}

export {
    routeCreator,
    Route,
    InParams,
    OutParams,
    InSearchParams,
    OutSearchParams,
    InStateParams,
    OutStateParams,
    RouteOptions,
    RouteMetaOptions,
    DecoratedChildren,
    RouteWithChildren,
    ExtractRouteParams,
    SanitizedPath,
    SanitizedChildren,
};
