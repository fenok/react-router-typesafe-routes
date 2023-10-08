import { PathnameType, SearchType, StateType, HashType, Type, DefType, string } from "../types/index.js";

/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */

type Route<
  TOptions extends RouteOptions = RouteOptions<PathConstraint, any, any, any>,
  TChildren = {},
> = DecoratedChildren<TOptions, TChildren> &
  BaseRoute<TOptions> & {
    $: DecoratedChildren<OmiTPathnameTypes<TOptions>, TChildren>;
  };

type DecoratedChildren<TOptions extends RouteOptions, TChildren> = {
  [TKey in keyof TChildren]: TChildren[TKey] extends Route<infer TChildOptions, infer TChildChildren>
    ? Route<MergedTypes<[TOptions, TChildOptions], "inherit">, TChildChildren>
    : TChildren[TKey];
};

interface BaseRoute<TOptions extends RouteOptions = RouteOptions<PathConstraint, any, any, any>> {
  $path: AbsolutePath<SanitizedPath<TOptions["path"]>>;
  $relativePath: PathWithoutIntermediateStars<SanitizedPath<TOptions["path"]>>;
  $buildPath: (opts: PathBuilderOptions<TOptions>) => string;
  $buildPathname: (
    params: InPathnameParams<TOptions["path"], TOptions["params"]>,
    opts?: PathnameBuilderOptions,
  ) => string;
  $getPlainParams: (
    params: InPathnameParams<TOptions["path"], TOptions["params"]>,
  ) => Record<string, string | undefined>;
  $getTypedParams: (params: Record<string, string | undefined>) => OutPathnameParams<TOptions["params"]>;
  $getTypedSearchParams: (searchParams: URLSearchParams) => OutSearchParams<TOptions["searchParams"]>;
  $getTypedHash: (hash: string) => OutHash<TOptions["hash"]>;
  $getTypedState: (state: unknown) => OutState<TOptions["state"]>;
  $getUntypedParams: (params: Record<string, string | undefined>) => Record<string, string | undefined>;
  $getUntypedSearchParams: (searchParams: URLSearchParams) => URLSearchParams;
  $getUntypedState: (state: unknown) => UntypedPlainState<TOptions["state"]>;
  $buildSearch: (params: InSearchParams<TOptions["searchParams"]>, opts?: SearchBuilderOptions) => string;
  $getPlainSearchParams: (
    params: InSearchParams<TOptions["searchParams"]>,
    opts?: SearchBuilderOptions,
  ) => URLSearchParams;
  $buildHash: (hash: InHash<TOptions["hash"]>) => string;
  $buildState: (state: InState<TOptions["state"]>, opts?: StateBuilderOptions) => PlainState<TOptions["state"]>;
  $types: TOptions;
}

type StringPath<T extends PathConstraint> = T extends undefined ? "" : T;

type PathBuilderOptions<TOptions extends RouteOptions> = Readable<
  InPathParams<TOptions> & PathnameBuilderOptions & SearchBuilderOptions
>;

interface PathnameBuilderOptions {
  relative?: boolean;
}

interface SearchBuilderOptions {
  untypedSearchParams?: URLSearchParams;
}

interface StateBuilderOptions {
  untypedState?: unknown;
}

type PlainState<TStateTypes extends StateTypesConstraint> = TStateTypes extends StateTypesObjectConstraint
  ? Record<string, unknown>
  : unknown;

type UntypedPlainState<TStateTypes extends StateTypesConstraint> = TStateTypes extends StateTypesObjectConstraint
  ? Record<string, unknown>
  : undefined;

type PathnameParamsRequired<T> = Partial<T> extends T ? (IsAny<T> extends true ? true : false) : true;

type InPathParams<TOptions extends RouteOptions> = Readable<
  (PathnameParamsRequired<InPathnameParams<TOptions["path"], TOptions["params"]>> extends true
    ? { params: InPathnameParams<TOptions["path"], TOptions["params"]> }
    : { params?: InPathnameParams<TOptions["path"], TOptions["params"]> }) & {
    searchParams?: InSearchParams<TOptions["searchParams"]>;
    hash?: InHash<TOptions["hash"]>;
  }
>;

type InPathnameParams<
  TPath extends PathConstraint,
  TPathnameTypes extends PathnameTypesConstraint,
> = IsAny<TPathnameTypes> extends true
  ? any
  : Merge<
      Pick<RawParams<TPathnameTypes, "in">, PathParam<PathWithoutIntermediateStars<TPath>, "all", "in">>,
      Partial<Pick<RawParams<TPathnameTypes, "in">, PathParam<PathWithoutIntermediateStars<TPath>, "optional", "in">>>
    >;

type OutPathnameParams<TPathnameTypes extends PathnameTypesConstraint> = Readable<
  PartialUndefined<RawParams<TPathnameTypes, "out">>
>;

type InSearchParams<TSearchTypes extends SearchTypesConstraint> = IsAny<TSearchTypes> extends true
  ? any
  : Readable<Partial<RawSearchParams<TSearchTypes, "in">>>;

type OutSearchParams<TSearchTypes extends SearchTypesConstraint> = Readable<
  PartialUndefined<RawSearchParams<TSearchTypes, "out">>
>;

type InState<TStateTypes extends StateTypesConstraint> = IsAny<TStateTypes> extends true
  ? any
  : TStateTypes extends StateTypesObjectConstraint
  ? Readable<Partial<RawStateParams<TStateTypes, "in">>>
  : TStateTypes extends StateTypesUnknownConstraint
  ? RawState<TStateTypes, "in">
  : never;

type OutState<TStateTypes extends StateTypesConstraint> = TStateTypes extends StateTypesObjectConstraint
  ? Readable<PartialUndefined<RawStateParams<TStateTypes, "out">>>
  : TStateTypes extends StateTypesUnknownConstraint
  ? RawState<TStateTypes, "out">
  : never;

type InHash<THash extends HashTypesConstraint> = NeverToUndefined<RawHash<THash, "in">>;

type OutHash<THash extends HashTypesConstraint> = NeverToUndefined<RawHash<THash, "out">>;

type RawParams<TTypes extends PathnameTypesConstraint, TMode extends "in" | "out"> = {
  [TKey in keyof TTypes]: TTypes[TKey] extends PathnameType<infer TOut, infer TIn>
    ? TMode extends "in"
      ? Exclude<TIn, undefined>
      : TOut
    : never;
};

type RawSearchParams<TTypes extends SearchTypesConstraint, TMode extends "in" | "out"> = {
  [TKey in keyof TTypes]: TTypes[TKey] extends SearchType<infer TOut, infer TIn>
    ? TMode extends "in"
      ? Exclude<TIn, undefined>
      : TOut
    : never;
};

type RawState<TTypes extends StateTypesUnknownConstraint, TMode extends "in" | "out"> = TTypes extends StateType<
  infer TOut,
  infer TIn
>
  ? TMode extends "in"
    ? Exclude<TIn, undefined>
    : TOut
  : never;

type RawStateParams<TTypes extends StateTypesObjectConstraint, TMode extends "in" | "out"> = {
  [TKey in keyof TTypes]: TTypes[TKey] extends StateType<infer TOut, infer TIn>
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

type PathWithoutIntermediateStars<T extends PathConstraint> = T extends `${infer TStart}*?/${infer TEnd}`
  ? PathWithoutIntermediateStars<`${TStart}${TEnd}`>
  : T extends `${infer TStart}*/${infer TEnd}`
  ? PathWithoutIntermediateStars<`${TStart}${TEnd}`>
  : T;

type AbsolutePath<T extends PathConstraint> = T extends string ? `/${T}` : T;

type SanitizedPathParam<
  TRawParam extends string,
  TKind extends "all" | "optional" = "all",
  TMode extends "in" | "out" = "out",
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
  TPath extends PathConstraint,
  TKind extends "all" | "optional" = "all",
  TMode extends "in" | "out" = "out",
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

type PathConstraint = string | undefined;

type PathnameTypesConstraint = Record<string, PathnameType<any>>;

type SearchTypesConstraint = Record<string, SearchType<any>>;

type StateTypesConstraint = StateTypesObjectConstraint | StateTypesUnknownConstraint;

type StateTypesObjectConstraint = Record<string, StateType<any>>;

type StateTypesUnknownConstraint = StateType<any>;

type HashTypesConstraint<T extends string = string> = T[] | HashType<any>;

interface RouteOptions<
  TPath extends PathConstraint = PathConstraint,
  TPathnameTypes extends PathnameTypesConstraint = PathnameTypesConstraint,
  TSearchTypes extends SearchTypesConstraint = SearchTypesConstraint,
  TStateTypes extends StateTypesConstraint = StateTypesConstraint,
  THash extends HashTypesConstraint = HashTypesConstraint,
> {
  path: TPath;
  params: TPathnameTypes;
  searchParams: TSearchTypes;
  state: TStateTypes;
  hash: THash;
}

type ExtractTypes<Tuple extends [...BaseRoute[]]> = {
  [Index in keyof Tuple]: Tuple[Index]["$types"];
};

type FilterPathnameTypes<T extends RouteOptions> = T extends RouteOptions<
  infer TPath,
  infer TPathnameTypes,
  infer TSearchTypes,
  infer TStateTypes,
  infer THash
>
  ? RouteOptions<
      TPath,
      TPath extends string ? Readable<Pick<TPathnameTypes, PathParam<TPath>>> : TPathnameTypes,
      TSearchTypes,
      TStateTypes,
      THash
    >
  : never;

type MergedTypes<T extends RouteOptions[], TMode extends "inherit" | "compose"> = T extends [
  infer TFirst,
  infer TSecond,
  ...infer TRest,
]
  ? TRest extends RouteOptions[]
    ? MergedTypes<[MergedTypesPair<TFirst, TSecond, TMode>, ...TRest], TMode>
    : never
  : T extends [infer TFirst]
  ? TFirst extends RouteOptions
    ? TFirst
    : never
  : never;

type MergedTypesPair<T, U, TMode extends "inherit" | "compose"> = T extends RouteOptions<
  infer TPath,
  infer TPathnameTypes,
  infer TSearchTypes,
  infer TState,
  infer THash
>
  ? U extends RouteOptions<
      infer TChildPath,
      infer TChildPathTypes,
      infer TChildSearchTypes,
      infer TChildState,
      infer TChildHash
    >
    ? RouteOptions<
        TMode extends "inherit"
          ? StringPath<TPath> extends ""
            ? TChildPath
            : StringPath<TChildPath> extends ""
            ? TPath
            : `${TPath}/${TChildPath}`
          : TChildPath,
        TMode extends "inherit"
          ? MergeTypesObjects<TPathnameTypes, TChildPathTypes>
          : Merge<TPathnameTypes, TChildPathTypes>,
        Merge<TSearchTypes, TChildSearchTypes>,
        TChildState extends StateTypesObjectConstraint
          ? TState extends StateTypesObjectConstraint
            ? Merge<TState, TChildState>
            : TState
          : TChildState,
        TChildHash extends string[] ? (THash extends string[] ? [...THash, ...TChildHash] : THash) : TChildHash
      >
    : never
  : never;

type DefaulTPathnameTypes<T extends PathConstraint> = RouteOptions<
  T,
  Merge<Record<PathParam<T>, Implicit<DefType<string>>>, Record<PathParam<T, "optional">, Implicit<Type<string>>>>,
  {},
  {},
  []
>;

type OmiTPathnameTypes<T extends RouteOptions> = T extends RouteOptions<
  infer TPath,
  infer TPathnameTypes,
  infer TSearchTypes,
  infer TStateTypes,
  infer THash
>
  ? RouteOptions<"", {}, TSearchTypes, TStateTypes, THash>
  : never;

type Merge<T, U> = Readable<Omit<T, keyof U> & U>;

type MergeTypesObjects<T, U> = Readable<Omit<T, keyof U> & ReplaceImplicit<U, T>>;

type ReplaceImplicit<U, T> = {
  [TKey in keyof U]: U[TKey] extends ImplicitMarker ? (TKey extends keyof T ? T[TKey] : U[TKey]) : U[TKey];
};

type Readable<T> = T extends object ? (T extends infer O ? { [K in keyof O]: O[K] } : never) : T;

type ImplicitMarker = { __implicit: true };

type Implicit<T> = T & ImplicitMarker;

type ErrorMessage<T extends string> = T & { [brand]: ErrorMessage<T> };

type IsAny<T> = 0 extends 1 & T ? true : false;

type PartialUndefined<T> = Undefined<T> & Omit<T, keyof Undefined<T>>;

type Undefined<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K];
};

type NeverToUndefined<T> = [T] extends [never] ? undefined : T;

type NormalizedPathTypes<TTypes, TPath extends PathConstraint> = Partial<
  Record<PathParam<TPath>, PathnameType<any>>
> extends TTypes
  ? {}
  : RequiredWithoutUndefined<TTypes>;

type RequiredWithoutUndefined<T> = {
  [P in keyof T]-?: Exclude<T[P], undefined>;
};

declare const brand: unique symbol;

function implicit<T>(value: T): Implicit<T> {
  return { ...value, __implicit: true };
}

function getDefaulTPathnameTypes<T extends PathConstraint>(path: T): DefaulTPathnameTypes<T> {
  const [allPathParams, optionalPathParams] = getPathParams(path);

  const params: Record<string, PathnameType<any>> = {};

  optionalPathParams.forEach((optionalParam) => {
    params[optionalParam] = implicit(string());
  });

  allPathParams.forEach((param) => {
    if (!params[param]) {
      params[param] = implicit(string().defined());
    }
  });

  return {
    path,
    params,
    searchParams: {},
    state: {},
    hash: [],
  } as DefaulTPathnameTypes<T>;
}

function createRoute(creatorOptions: CreateRouteOptions) {
  function route<
    TPath extends PathConstraint = undefined,
    // We actually want {} by default, but it breaks autocomplete for some reason.
    TPathnameTypes extends Partial<Record<PathParam<TPath>, PathnameType<any>>> = Partial<
      Record<PathParam<TPath>, PathnameType<any>>
    >,
    TSearchTypes extends SearchTypesConstraint = {},
    TStateTypes extends StateTypesConstraint = {},
    THashString extends string = string,
    THash extends HashTypesConstraint<THashString> = [],
    // The main reason for restricting this to pathless routes is to optimize types for implicit pathname types.
    TComposedRoutes extends [...BaseRoute<RouteOptions<undefined, any, any, any>>[]] = [],
    // This should be restricted to Record<string, BaseRoute>, but it breaks types for nested routes,
    // even without names validity check
    TChildren = {},
  >(opts: {
    path?: SanitizedPath<TPath>;
    compose?: [...TComposedRoutes];
    // Forbid undefined values and non-existent keys (if there are params in path)
    params?: TPath extends undefined
      ? PathnameTypesConstraint
      : {
          [TKey in keyof TPathnameTypes]: TKey extends PathParam<TPath>
            ? TPathnameTypes[TKey] extends undefined
              ? PathnameType<any>
              : TPathnameTypes[TKey]
            : ErrorMessage<"There is no such param in path">;
        };
    searchParams?: TSearchTypes;
    state?: TStateTypes;
    hash?: THash;
    children?: TChildren;
  }): Route<
    FilterPathnameTypes<
      MergedTypes<
        [
          DefaulTPathnameTypes<TPath>,
          ...ExtractTypes<TComposedRoutes>,
          RouteOptions<TPath, NormalizedPathTypes<TPathnameTypes, TPath>, TSearchTypes, TStateTypes, THash>,
        ],
        "compose"
      >
    >,
    TChildren
  > {
    const path = opts.path as SanitizedPath<TPath>;

    const defaultTypes = getDefaulTPathnameTypes(path);

    const composedTypes = (opts.compose ?? []).map(({ $types }) => $types) as ExtractTypes<TComposedRoutes>;

    const ownTypes = {
      path: opts.path ?? undefined,
      params: opts?.params ?? {},
      searchParams: opts?.searchParams ?? {},
      state: opts?.state ?? {},
      hash: opts?.hash ?? [],
    } as RouteOptions<TPath, NormalizedPathTypes<TPathnameTypes, TPath>, TSearchTypes, TStateTypes, THash>;

    const resolvedTypes = filterPathnameTypes(mergeTypes([defaultTypes, ...composedTypes, ownTypes], "compose"));

    const resolvedChildren = resolveChildren(opts.children);

    return {
      ...decorateChildren(resolvedTypes, creatorOptions, resolvedChildren),
      ...getRoute(resolvedTypes, creatorOptions),
      $: decorateChildren(omiTPathnameTypes(resolvedTypes), creatorOptions, resolvedChildren),
    } as unknown as Route<
      FilterPathnameTypes<
        MergedTypes<
          [
            DefaulTPathnameTypes<TPath>,
            ...ExtractTypes<TComposedRoutes>,
            RouteOptions<TPath, NormalizedPathTypes<TPathnameTypes, TPath>, TSearchTypes, TStateTypes, THash>,
          ],
          "compose"
        >
      >,
      TChildren
    >;
  }

  return route;
}

function resolveChildren<T>(children?: T): T | undefined {
  if (children && Object.keys(children).some((key) => key.startsWith("$"))) {
    throw new Error('Children names starting with "$" are forbidden');
  }

  return children;
}

function omiTPathnameTypes<T extends RouteOptions>(types: T): OmiTPathnameTypes<T> {
  return { ...types, params: {}, path: "" } as unknown as OmiTPathnameTypes<T>;
}

function mergeTypes<T extends [...RouteOptions[]], TMode extends "compose" | "inherit">(
  typesArray: [...T],
  mode: TMode,
): MergedTypes<T, TMode> {
  return typesArray.reduce((acc, item) => {
    const [implicitParams, explicitParams] = splitImplicit(item.params);

    return {
      path:
        mode === "compose"
          ? item.path
          : ["", undefined].includes(acc.path)
          ? item.path
          : ["", undefined].includes(item.path)
          ? acc.path
          : `${acc.path}/${item.path}`,
      params: { ...implicitParams, ...acc.params, ...explicitParams },
      searchParams: { ...acc.searchParams, ...item.searchParams },
      hash: isHashType(item.hash)
        ? item.hash
        : isHashType(acc.hash)
        ? acc.hash
        : [...(acc.hash || []), ...(item.hash || [])],
      state: { ...acc.state, ...item.state },
    };
  }) as MergedTypes<T, TMode>;
}

function splitImplicit<T>(record: Record<string, T | Implicit<T>>): [Record<string, Implicit<T>>, Record<string, T>] {
  const implicit: Record<string, Implicit<T>> = {};
  const explicit: Record<string, T> = {};

  Object.keys(record).forEach((key) => {
    const value = record[key];

    if (isImplicit(value)) {
      implicit[key] = value;
    } else {
      explicit[key] = value;
    }
  });

  return [implicit, explicit];
}

function isImplicit<T>(value: T | Implicit<T>): value is Implicit<T> {
  return Boolean((value as Implicit<T>)?.__implicit);
}

function filterPathnameTypes<TOptions extends RouteOptions>(types: TOptions): FilterPathnameTypes<TOptions> {
  if (typeof types.path === "undefined") return types as unknown as FilterPathnameTypes<TOptions>;

  const [allPathParams] = getPathParams(types.path);

  const params: Record<string, PathnameType<any>> = {};

  allPathParams.forEach((param) => {
    params[param] = types.params[param];
  });

  return {
    ...types,
    params,
  } as unknown as FilterPathnameTypes<TOptions>;
}

function isHashType<T extends HashType<any>>(value: T | string[] | undefined): value is T {
  return Boolean(value) && !Array.isArray(value);
}

function decorateChildren<TOptions extends RouteOptions, TChildren>(
  typesObj: TOptions,
  creatorOptions: CreateRouteOptions,
  children: TChildren | undefined,
): DecoratedChildren<TOptions, TChildren> {
  const result: Record<string, unknown> = {};

  if (children) {
    Object.keys(children).forEach((key) => {
      // Explicit unknown is required for the type guard to work in TS 5.1 for some reason
      const value: unknown = children[key as keyof typeof children];

      result[key] = isRoute(value)
        ? {
            ...decorateChildren(typesObj, creatorOptions, value),
            ...getRoute(mergeTypes([typesObj, value.$types], "inherit"), creatorOptions),
            $: decorateChildren(omiTPathnameTypes(typesObj), creatorOptions, value.$),
          }
        : value;
    });
  }

  return result as DecoratedChildren<TOptions, TChildren>;
}

function getRoute<TOptions extends RouteOptions>(
  types: TOptions,
  creatorOptions: CreateRouteOptions,
): BaseRoute<TOptions> {
  const [allPathParams] = getPathParams(types.path);
  const relativePath = removeIntermediateStars(types.path);

  function getPlainParams(params: InPathnameParams<TOptions["path"], TOptions["params"]>) {
    return getPlainParamsByTypes(allPathParams, params, types.params);
  }

  function buildPathname(
    params: InPathnameParams<TOptions["path"], TOptions["params"]>,
    opts?: PathnameBuilderOptions,
  ) {
    const rawBuiltPath = creatorOptions.generatePath(relativePath ?? "", getPlainParams(params));
    const relativePathname = rawBuiltPath.startsWith("/") ? rawBuiltPath.substring(1) : rawBuiltPath;

    return `${opts?.relative ? "" : "/"}${relativePathname}`;
  }

  function buildPath(opts: PathBuilderOptions<TOptions>) {
    const pathnameParams = opts.params ?? ({} as InPathnameParams<TOptions["path"], TOptions["params"]>);
    const searchParams = opts.searchParams ?? ({} as InSearchParams<TOptions["searchParams"]>);
    const hash = opts.hash;

    return `${buildPathname(pathnameParams, opts)}${buildSearch(searchParams, opts)}${
      hash !== undefined ? buildHash(hash) : ""
    }`;
  }

  function getPlainSearchParams(params: InSearchParams<TOptions["searchParams"]>, opts?: SearchBuilderOptions) {
    const plainParams = creatorOptions.createSearchParams(getPlainSearchParamsByTypes(params, types.searchParams));

    if (opts?.untypedSearchParams) {
      appendSearchParams(plainParams, getUntypedSearchParams(opts?.untypedSearchParams));
    }

    return plainParams;
  }

  function buildSearch(params: InSearchParams<TOptions["searchParams"]>, opts?: SearchBuilderOptions) {
    const searchString = creatorOptions.createSearchParams(getPlainSearchParams(params, opts)).toString();

    return searchString ? `?${searchString}` : "";
  }

  function buildHash(hash: InHash<TOptions["hash"]>) {
    if (isHashType(types.hash)) {
      return `#${types.hash.getPlainHash(hash)}`;
    }
    return `#${String(hash)}`;
  }

  function buildState(params: InState<TOptions["state"]>, opts?: StateBuilderOptions) {
    return (
      isStateType(types.state)
        ? getPlainStateByType(params, types.state)
        : Object.assign(getPlainStateParamsByTypes(params, types.state), getUntypedState(opts?.untypedState))
    ) as PlainState<TOptions["state"]>;
  }

  function getTypedParams(params: Record<string, string | undefined>) {
    return getTypedParamsByTypes(params, types.params as TOptions["params"]);
  }

  function getUntypedParams(params: Record<string, string | undefined>) {
    const result: Record<string, string | undefined> = {};

    Object.keys(params).forEach((key) => {
      if (!types.params[key]) {
        result[key] = params[key];
      }
    });

    return result;
  }

  function getTypedSearchParams(params: URLSearchParams) {
    return getTypedSearchParamsByTypes(params, types.searchParams as TOptions["searchParams"]);
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
    return isStateType(types.state)
      ? getTypedStateByType(state, types.state)
      : getTypedStateByTypes(state, types.state);
  }

  function getUntypedState(state: unknown) {
    const result = (isStateType(types.state) ? undefined : {}) as UntypedPlainState<TOptions["state"]>;

    if (!isRecord(state) || !result) return result;

    const typedKeys = types.state ? Object.keys(types.state) : [];

    Object.keys(state).forEach((key) => {
      if (typedKeys.indexOf(key) === -1) {
        result[key] = state[key];
      }
    });

    return result;
  }

  function getTypedHash(hash: string): OutHash<TOptions["hash"]> {
    const normalizedHash = hash?.substring(1, hash?.length);

    if (isHashType(types.hash)) {
      return types.hash.getTypedHash(normalizedHash);
    }

    if (normalizedHash && types.hash.indexOf(normalizedHash) !== -1) {
      return normalizedHash as OutHash<TOptions["hash"]>;
    }

    return undefined as OutHash<TOptions["hash"]>;
  }

  return {
    $path: makeAbsolute(types.path) as AbsolutePath<SanitizedPath<TOptions["path"]>>,
    $relativePath: relativePath as PathWithoutIntermediateStars<SanitizedPath<TOptions["path"]>>,
    $buildPath: buildPath,
    $buildPathname: buildPathname,
    $getPlainParams: getPlainParams,
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
    $getPlainSearchParams: getPlainSearchParams,
    $types: types,
  };
}

function getPlainParamsByTypes(
  keys: string[],
  params: Record<string, unknown>,
  types: Partial<Record<string, PathnameType<unknown, never>>>,
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
  types: Partial<Record<string, SearchType<unknown, never>>>,
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
  types: Partial<Record<string, StateType<unknown, never>>>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  Object.keys(params).forEach((key) => {
    const type = types[key];
    const value = params[key];

    if (type && value !== undefined) {
      result[key] = type.getPlainState(value as never);
    }
  });

  return result;
}

function getPlainStateByType(state: unknown, type: StateType<any>): unknown {
  return type.getPlainState(state);
}

function getTypedParamsByTypes<TPathnameTypes extends PathnameTypesConstraint>(
  params: Record<string, string | undefined>,
  types: TPathnameTypes,
): OutPathnameParams<TPathnameTypes> {
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

  return result as OutPathnameParams<TPathnameTypes>;
}

function getTypedSearchParamsByTypes<TSearchTypes extends SearchTypesConstraint>(
  searchParams: URLSearchParams,
  types: TSearchTypes,
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

function getTypedStateByTypes<TStateTypes extends StateTypesObjectConstraint>(
  state: unknown,
  types: TStateTypes,
): OutState<TStateTypes> {
  const result: Record<string, unknown> = {};

  if (isRecord(state)) {
    Object.keys(types).forEach((key) => {
      const type = types[key];

      if (type) {
        const typedStateParam = type.getTypedState(state[key]);
        if (typedStateParam !== undefined) {
          result[key] = typedStateParam;
        }
      }
    });
  }

  return result as OutState<TStateTypes>;
}

function getTypedStateByType<TStateTypes extends StateTypesUnknownConstraint>(
  state: unknown,
  type: TStateTypes,
): OutState<TStateTypes> {
  return type.getTypedState(state);
}

function getPathParams<TPath extends PathConstraint>(
  path: TPath,
): [PathParam<TPath>[], PathParam<TPath, "optional">[]] {
  const allParams = [];
  const optionalParams = [];

  path
    ?.split(":")
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

  if (path?.includes("*?")) {
    allParams.push("*");
    optionalParams.push("*");
  } else if (path?.includes("*")) {
    allParams.push("*");
  }

  return [allParams, optionalParams] as [PathParam<TPath>[], PathParam<TPath, "optional">[]];
}

function removeIntermediateStars<TPath extends PathConstraint>(path: TPath): PathWithoutIntermediateStars<TPath> {
  return path?.replace(/\*\??\//g, "") as PathWithoutIntermediateStars<TPath>;
}

function makeAbsolute<TPath extends PathConstraint>(path: TPath): AbsolutePath<TPath> {
  return (typeof path === "string" ? `/${path}` : path) as AbsolutePath<TPath>;
}

function isRoute(value: unknown): value is Route<RouteOptions, unknown> {
  return Boolean(value && typeof value === "object" && "$path" in value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}

function isStateType<T extends StateType<any>>(value: T | Record<string, StateType<any>>): value is T {
  return typeof (value as StateType<any>).getPlainState === "function";
}

function appendSearchParams(target: URLSearchParams, source: URLSearchParams) {
  for (const [key, val] of source.entries()) {
    target.append(key, val);
  }

  return target;
}

export {
  createRoute,
  CreateRouteOptions,
  Route,
  BaseRoute,
  DecoratedChildren,
  RouteOptions,
  PathParam,
  SanitizedPath,
  InPathParams,
  InPathnameParams,
  OutPathnameParams,
  InSearchParams,
  OutSearchParams,
  InState,
  OutState,
  InHash,
  OutHash,
  ErrorMessage,
};
