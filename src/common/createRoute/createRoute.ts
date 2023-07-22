import { ParamType, SearchParamType, StateParamType, HashType, Type, DefType, string } from "../types/index.js";

/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */

type Route<
    TPath extends string = string,
    TTypes extends Types = Types<any, any, any>,
    TChildren = {}
> = DecoratedChildren<TPath, TTypes, TChildren> &
    BaseRoute<TPath, TTypes> & {
        $: DecoratedChildren<"", OmitPathTypes<TTypes>, TChildren>;
    };

type DecoratedChildren<TPath extends string, TTypes extends Types, TChildren> = {
    [TKey in keyof TChildren]: TChildren[TKey] extends Route<infer TChildPath, infer TChildTypes, infer TChildChildren>
        ? Route<
              TPath extends "" ? TChildPath : TChildPath extends "" ? TPath : `${TPath}/${TChildPath}`,
              MergedTypes<[TTypes, TChildTypes]>,
              TChildChildren
          >
        : TChildren[TKey];
};

type BaseRoute<TPath extends string = string, TTypes extends Types = Types<any, any, any>> = {
    $path: `/${SanitizedPath<TPath>}`;
    $relativePath: PathWithoutIntermediateStars<SanitizedPath<TPath>>;
    $getPlainParams: (params: InParams<TPath, TTypes["params"]>) => Record<string, string | undefined>;
    $getPlainSearchParams: (params: InSearchParams<TTypes["searchParams"]>) => Record<string, string | string[]>;
    $getTypedParams: (params: Record<string, string | undefined>) => OutParams<TTypes["params"]>;
    $getTypedSearchParams: (searchParams: URLSearchParams) => OutSearchParams<TTypes["searchParams"]>;
    $getTypedHash: (hash: string) => OutHash<TTypes["hash"]>;
    $getTypedState: (state: unknown) => OutStateParams<TTypes["state"]>;
    $getUntypedParams: (params: Record<string, string | undefined>) => Record<string, string | undefined>;
    $getUntypedSearchParams: (searchParams: URLSearchParams) => URLSearchParams;
    $getUntypedState: (state: unknown) => Record<string, unknown>;
    $buildPath: (
        params: InParams<TPath, TTypes["params"]> &
            InSearchParams<TTypes["searchParams"]> & { hash?: InHash<TTypes["hash"]> },
        opts?: PathnameBuilderOptions
    ) => string;
    $buildPathname: (params: InParams<TPath, TTypes["params"]>, opts?: PathnameBuilderOptions) => string;
    $buildSearch: (params: InSearchParams<TTypes["searchParams"]>) => string;
    $buildHash: (hash: InHash<TTypes["hash"]>) => string;
    $buildState: (state: InStateParams<TTypes["state"]>) => Record<string, unknown>;
    $types: TTypes;
};

interface PathnameBuilderOptions {
    relative: boolean;
}

type InParams<TPath extends string, TPathTypes extends PathTypesConstraint> = IsAny<TPathTypes> extends true
    ? any
    : Merge<
          Pick<RawParams<TPathTypes, "in">, PathParam<PathWithoutIntermediateStars<TPath>, "all", "in">>,
          Partial<Pick<RawParams<TPathTypes, "in">, PathParam<PathWithoutIntermediateStars<TPath>, "optional", "in">>>
      >;

type OutParams<TPathTypes extends PathTypesConstraint> = Readable<PartialUndefined<RawParams<TPathTypes, "out">>>;

type InSearchParams<TSearchTypes extends SearchTypesConstraint> = IsAny<TSearchTypes> extends true
    ? any
    : Readable<Partial<RawSearchParams<TSearchTypes, "in">>>;

type OutSearchParams<TSearchTypes extends SearchTypesConstraint> = Readable<
    PartialUndefined<RawSearchParams<TSearchTypes, "out">>
>;

type InStateParams<TStateTypes extends StateTypesConstraint> = IsAny<TStateTypes> extends true
    ? any
    : Readable<Partial<RawStateParams<TStateTypes, "in">>>;

type OutStateParams<TStateTypes extends StateTypesConstraint> = Readable<
    PartialUndefined<RawStateParams<TStateTypes, "out">>
>;

type InHash<THash extends HashTypesConstraint> = NeverToUndefined<RawHash<THash, "in">>;

type OutHash<THash extends HashTypesConstraint> = NeverToUndefined<RawHash<THash, "out">>;

type RawParams<TTypes extends PathTypesConstraint, TMode extends "in" | "out"> = {
    [TKey in keyof TTypes]: TTypes[TKey] extends ParamType<infer TOut, infer TIn>
        ? TMode extends "in"
            ? Exclude<TIn, undefined>
            : TOut
        : never;
};

type RawSearchParams<TTypes extends SearchTypesConstraint, TMode extends "in" | "out"> = {
    [TKey in keyof TTypes]: TTypes[TKey] extends SearchParamType<infer TOut, infer TIn>
        ? TMode extends "in"
            ? Exclude<TIn, undefined>
            : TOut
        : never;
};

type RawStateParams<TTypes extends StateTypesConstraint, TMode extends "in" | "out"> = {
    [TKey in keyof TTypes]: TTypes[TKey] extends StateParamType<infer TOut, infer TIn>
        ? TMode extends "in"
            ? Exclude<TIn, undefined>
            : TOut
        : never;
};

type RawHash<THash, TMode extends "in" | "out"> = THash extends string[]
    ? TMode extends "in"
        ? THash[number]
        : THash[number] | undefined
    : THash extends HashType<infer TOut, infer TIn>
    ? TMode extends "in"
        ? Exclude<TIn, undefined>
        : TOut
    : never;

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
        ? TKey extends Omit$<TKey>
            ? T
            : ErrorMessage<"Children names can't start with $">
        : T
    : T;

type Omit$<T extends string> = T extends `$${infer TValid}` ? TValid : T;

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

type PathTypesConstraint = Record<string, ParamType<any>>;

type SearchTypesConstraint = Record<string, SearchParamType<any>>;

type StateTypesConstraint = Record<string, StateParamType<any>>;

type HashTypesConstraint<T extends string = string> = T[] | HashType<any>;

interface Types<
    TPathTypes extends PathTypesConstraint = PathTypesConstraint,
    TSearchTypes extends SearchTypesConstraint = SearchTypesConstraint,
    TStateTypes extends StateTypesConstraint = StateTypesConstraint,
    THash extends HashTypesConstraint = HashTypesConstraint
> {
    params: TPathTypes;
    searchParams: TSearchTypes;
    state: TStateTypes;
    hash: THash;
}

type ExtractTypes<Tuple extends [...BaseRoute[]]> = {
    [Index in keyof Tuple]: Tuple[Index]["$types"];
};

type MergedTypes<T extends Types[]> = T extends [infer TFirst, infer TSecond, ...infer TRest]
    ? TRest extends Types[]
        ? MergedTypes<[MergedTypesPair<TFirst, TSecond>, ...TRest]>
        : never
    : T extends [infer TFirst]
    ? TFirst extends Types
        ? TFirst
        : never
    : never;

type MergedTypesPair<T, U> = T extends Types<infer TPathTypes, infer TSearchTypes, infer TState, infer THash>
    ? U extends Types<infer TChildPathTypes, infer TChildSearchTypes, infer TChildState, infer TChildHash>
        ? Types<
              Merge<TPathTypes, TChildPathTypes>,
              Merge<TSearchTypes, TChildSearchTypes>,
              Merge<TState, TChildState>,
              TChildHash extends string[] ? (THash extends string[] ? [...THash, ...TChildHash] : THash) : TChildHash
          >
        : never
    : never;

type DefaultPathTypes<T extends string> = Types<
    Merge<Record<PathParam<T>, DefType<string>>, Record<PathParam<T, "optional">, Type<string>>>,
    {},
    {},
    []
>;

type OmitPathTypes<T extends Types> = T extends Types<
    infer TPathTypes,
    infer TSearchTypes,
    infer TStateTypes,
    infer THash
>
    ? Types<{}, TSearchTypes, TStateTypes, THash>
    : never;

type Merge<T, U> = Readable<Omit<T, keyof U> & U>;

type Readable<T> = Identity<{
    [K in keyof T]: T[K];
}>;

type Identity<T> = T;

type ErrorMessage<T extends string> = T & { [brand]: ErrorMessage<T> };

type IsAny<T> = 0 extends 1 & T ? true : false;

type PartialUndefined<T> = Undefined<T> & Omit<T, keyof Undefined<T>>;

type Undefined<T> = {
    [K in keyof T as undefined extends T[K] ? K : never]?: T[K];
};

type NeverToUndefined<T> = [T] extends [never] ? undefined : T;

declare const brand: unique symbol;

function getDefaultPathTypes<T extends string>(path: T): DefaultPathTypes<T> {
    const [allPathParams, optionalPathParams] = getPathParams(path);

    const params: Record<string, ParamType<any>> = {};

    optionalPathParams.forEach((optionalParam) => {
        params[optionalParam] = string();
    });

    allPathParams.forEach((param) => {
        if (!params[param]) {
            params[param] = string().defined();
        }
    });

    return {
        params,
        searchParams: {},
        state: {},
        hash: [],
    } as DefaultPathTypes<T>;
}

function createRoute(creatorOptions: CreateRouteOptions) {
    function route<
        TPath extends string = "",
        TPathTypes extends PathTypesConstraint = {},
        TSearchTypes extends SearchTypesConstraint = {},
        TStateTypes extends StateTypesConstraint = {},
        THashString extends string = string,
        THash extends HashTypesConstraint<THashString> = [],
        TComposedRoutes extends [...BaseRoute[]] = [],
        // This should be restricted to Record<string, BaseRoute>, but it breaks types for nested routes,
        // even without names validity check
        TChildren = {}
    >(opts: {
        path?: SanitizedPath<TPath>;
        compose?: [...TComposedRoutes];
        params?: TPathTypes;
        searchParams?: TSearchTypes;
        state?: TStateTypes;
        hash?: THash;
        children?: SanitizedChildren<TChildren>;
    }): Route<
        TPath,
        MergedTypes<
            [
                DefaultPathTypes<TPath>,
                ...ExtractTypes<TComposedRoutes>,
                Types<TPathTypes, TSearchTypes, TStateTypes, THash>
            ]
        >,
        TChildren
    > {
        const path = opts.path ?? ("" as SanitizedPath<TPath>);

        const defaultTypes = getDefaultPathTypes(path);

        const composedTypes = (opts.compose ?? []).map(({ $types }) => $types) as ExtractTypes<TComposedRoutes>;

        const ownTypes = {
            params: opts?.params ?? {},
            searchParams: opts?.searchParams ?? {},
            state: opts?.state ?? {},
            hash: opts?.hash ?? [],
        } as Types<TPathTypes, TSearchTypes, TStateTypes, THash>;

        const resolvedTypes = mergeTypes([defaultTypes, ...composedTypes, ownTypes]);

        const resolvedChildren = opts.children;

        return {
            ...decorateChildren(path, resolvedTypes, creatorOptions, resolvedChildren),
            ...getRoute(path, resolvedTypes, creatorOptions),
            $: decorateChildren("", omitPathTypes(resolvedTypes), creatorOptions, resolvedChildren),
        } as unknown as Route<
            TPath,
            MergedTypes<
                [
                    DefaultPathTypes<TPath>,
                    ...ExtractTypes<TComposedRoutes>,
                    Types<TPathTypes, TSearchTypes, TStateTypes, THash>
                ]
            >,
            TChildren
        >;
    }

    return route;
}

function omitPathTypes<T extends Types>(types: T): OmitPathTypes<T> {
    return { ...types, params: {} } as unknown as OmitPathTypes<T>;
}

function mergeTypes<T extends [...Types[]]>(typesArray: [...T]): MergedTypes<T> {
    return typesArray.reduce((acc, item) => {
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
    }) as MergedTypes<T>;
}

function isHashType<T extends HashType<any>>(value: T | string[] | undefined): value is T {
    return Boolean(value) && !Array.isArray(value);
}

function decorateChildren<TPath extends string, TTypes extends Types, TChildren>(
    path: SanitizedPath<TPath>,
    typesObj: TTypes,
    creatorOptions: CreateRouteOptions,
    children: TChildren | undefined
): DecoratedChildren<TPath, TTypes, TChildren> {
    const result: Record<string, unknown> = {};

    if (children) {
        Object.keys(children).forEach((key) => {
            const value = children[key as keyof typeof children];

            result[key] = isRoute(value)
                ? {
                      ...decorateChildren(path, typesObj, creatorOptions, value),
                      ...getRoute(
                          path === "" ? value.$path.substring(1) : value.$path === "/" ? path : `${path}${value.$path}`,
                          mergeTypes([typesObj, value.$types]),
                          creatorOptions
                      ),
                      $: decorateChildren("", omitPathTypes(typesObj), creatorOptions, value.$),
                  }
                : value;
        });
    }

    return result as DecoratedChildren<TPath, TTypes, TChildren>;
}

function getRoute<TPath extends string, TTypes extends Types>(
    path: SanitizedPath<TPath>,
    types: TTypes,
    creatorOptions: CreateRouteOptions
): BaseRoute<TPath, TTypes> {
    const [allPathParams] = getPathParams(path);
    const relativePath = removeIntermediateStars(path);

    function getPlainParams(params: InParams<TPath, TTypes["params"]>) {
        return getPlainParamsByTypes(allPathParams, params, types.params);
    }

    function getPlainSearchParams(params: InSearchParams<TTypes["searchParams"]>) {
        return getPlainSearchParamsByTypes(params, types.searchParams);
    }

    function buildPathname(params: InParams<TPath, TTypes["params"]>, opts?: PathnameBuilderOptions) {
        const rawBuiltPath = creatorOptions.generatePath(relativePath, getPlainParams(params));
        const relativePathname = rawBuiltPath.startsWith("/") ? rawBuiltPath.substring(1) : rawBuiltPath;

        return `${opts?.relative ? "" : "/"}${relativePathname}`;
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

    function buildPath(
        params: InParams<TPath, TTypes["params"]> &
            InSearchParams<TTypes["searchParams"]> & { hash?: InHash<TTypes["hash"]> },

        opts?: PathnameBuilderOptions
    ) {
        return `${buildPathname(params, opts)}${buildSearch(params)}${
            params.hash !== undefined ? buildHash(params.hash) : ""
        }`;
    }

    function getTypedParams(params: Record<string, string | undefined>) {
        return getTypedParamsByTypes(params, types.params as TTypes["params"]);
    }

    function getUntypedParams(params: Record<string, string | undefined>) {
        const result: Record<string, string | undefined> = {};

        const typedKeys: string[] = allPathParams;

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
        $path: `/${path}`,
        $relativePath: relativePath,
        $buildPath: buildPath,
        $buildPathname: buildPathname,
        $buildSearch: buildSearch,
        $buildHash: buildHash,
        $buildState: buildState,
        $getTypedParams: getTypedParams,
        $getTypedSearchParams: getTypedSearchParams,
        $getTypedHash: getTypedHash,
        $getTypedState: getTypedState,
        $getUntypedParams: getUntypedParams,
        $getUntypedSearchParams: getUntypedSearchParams,
        $getUntypedState: getUntypedState,
        $getPlainParams: getPlainParams,
        $getPlainSearchParams: getPlainSearchParams,
        $types: types,
    };
}

function getPlainParamsByTypes(
    keys: string[],
    params: Record<string, unknown>,
    types: Partial<Record<string, ParamType<unknown, never>>>
): Record<string, string> {
    const result: Record<string, string> = {};

    Object.keys(params).forEach((key) => {
        const type = types[key];
        const value = params[key];

        if (type && keys.indexOf(key) !== -1 && value !== undefined) {
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

function getTypedParamsByTypes<TPathTypes extends PathTypesConstraint>(
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

function getTypedSearchParamsByTypes<TSearchTypes extends SearchTypesConstraint>(
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

function getTypedStateByTypes<TStateTypes extends StateTypesConstraint>(
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

function getPathParams<TPath extends string>(path: TPath): [PathParam<TPath>[], PathParam<TPath, "optional">[]] {
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
    return Boolean(value && typeof value === "object" && "$path" in value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === "object");
}

export {
    createRoute,
    CreateRouteOptions,
    Route,
    BaseRoute,
    DecoratedChildren,
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
