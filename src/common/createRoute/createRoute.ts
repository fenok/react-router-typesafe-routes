import { PathnameType, SearchType, StateType, HashType, string } from "../types/index.js";

/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */

type Route<TSpec extends RouteSpec = RouteSpec, TChildren = {}> = RouteApi<TSpec> &
  RouteChildren<TSpec, TChildren> & { $: RouteChildren<OmitPath<TSpec>, TChildren> };

type RouteChildren<TSpec extends RouteSpec, TChildren> = {
  [TKey in keyof TChildren]: TChildren[TKey] extends Route<infer TChildOptions, infer TChildChildren>
    ? Route<MergeRouteSpecList<[TSpec, TChildOptions], "inherit">, TChildChildren>
    : TChildren[TKey];
};

interface RouteApi<TSpec extends RouteSpec = RouteSpec> {
  $path: AbsolutePath<TSpec["path"]>;
  $relativePath: PathWithoutIntermediateStars<TSpec["path"]>;
  $buildPath: (opts: BuildPathOptions<TSpec>) => string;
  $buildPathname: (opts: BuildPathnameOptions<TSpec>) => string;
  $buildPathnameParams: (opts: BuildPathnameOptions<TSpec>) => PathnameParams;
  $buildSearch: (opts: BuildSearchOptions<TSpec>) => string;
  $buildSearchParams: (opts: BuildSearchOptions<TSpec>) => URLSearchParams;
  $buildHash: (opts: BuildHashOptions<TSpec>) => string;
  $buildState: (opts: BuildStateOptions<TSpec>) => PlainState<TSpec["state"]>;
  $validateParams: (params: PathnameParams) => OutPathnameParams<TSpec>;
  $validateSearchParams: (searchParams: URLSearchParams) => OutSearchParams<TSpec>;
  $validateHash: (hash: string) => OutHash<TSpec>;
  $validateState: (state: unknown) => OutState<TSpec>;
  $spec: TSpec;
}

type PathnameParams = Record<string, string | undefined>;

type BuildPathOptions<TSpec extends RouteSpec> = Readable<
  InPathParams<TSpec> & PathnameBuilderOptions & SearchBuilderOptions
>;

type BuildPathnameOptions<TSpec extends RouteSpec> = Readable<
  { params: InPathnameParams<TSpec> } & PathnameBuilderOptions
>;

type BuildSearchOptions<TSpec extends RouteSpec> = Readable<
  { searchParams: InSearchParams<TSpec> } & SearchBuilderOptions
>;

type BuildHashOptions<TSpec extends RouteSpec> = Readable<{ hash: InHash<TSpec> }>;

type BuildStateOptions<TSpec extends RouteSpec> = Readable<{ state: InState<TSpec> } & StateBuilderOptions>;

interface PathnameBuilderOptions {
  relative?: boolean;
}

interface SearchBuilderOptions {
  untypedSearchParams?: URLSearchParams | undefined;
}

interface StateBuilderOptions {
  untypedState?: unknown;
}

type PlainState<TState extends StateConstraint> = TState extends StateObjectConstraint
  ? Record<string, unknown>
  : unknown;

type UntypedPlainState<TState extends StateConstraint> = TState extends StateObjectConstraint
  ? Record<string, unknown>
  : undefined;

type InPathParams<TSpec extends RouteSpec> = Readable<
  (PathnameParamsRequired<InPathnameParams<TSpec>> extends true
    ? { params: InPathnameParams<TSpec> }
    : { params?: InPathnameParams<TSpec> }) & {
    searchParams?: InSearchParams<TSpec>;
    hash?: InHash<TSpec>;
  }
>;

type PathnameParamsRequired<T> = Partial<T> extends T ? (IsAny<T> extends true ? true : false) : true;

type InPathnameParams<TSpec extends RouteSpec> = Merge<
  InferredPathnameParams<TSpec["path"]>,
  TSpec["params"]
> extends infer TResolvedPathnameParams
  ? TResolvedPathnameParams extends PathnameParamsConstraint
    ? IsAny<TResolvedPathnameParams> extends true
      ? any
      : Merge<
          Pick<RawParams<TResolvedPathnameParams, "in">, PathParam<TSpec["path"], "all", "in">>,
          PartialWithUndefined<
            Pick<RawParams<TResolvedPathnameParams, "in">, PathParam<TSpec["path"], "optional", "in">>
          >
        >
    : never
  : never;

type OutPathnameParams<TSpec extends RouteSpec> = Merge<
  InferredPathnameParams<TSpec["path"]>,
  TSpec["params"]
> extends infer TResolvedPathnameParams
  ? TResolvedPathnameParams extends PathnameParamsConstraint
    ? Readable<
        UndefinedToPartial<
          undefined extends TSpec["path"]
            ? RawParams<TResolvedPathnameParams, "out">
            : Pick<RawParams<TResolvedPathnameParams, "out">, PathParam<TSpec["path"]>>
        >
      >
    : never
  : never;

type InSearchParams<TSpec extends RouteSpec> = IsAny<TSpec["searchParams"]> extends true
  ? any
  : Readable<PartialWithUndefined<RawSearchParams<TSpec["searchParams"], "in">>>;

type OutSearchParams<TSpec extends RouteSpec> = Readable<
  UndefinedToPartial<RawSearchParams<TSpec["searchParams"], "out">>
>;

type InHash<TSpec extends RouteSpec> = RawHash<TSpec["hash"], "in">;

type OutHash<TSpec extends RouteSpec> = RawHash<TSpec["hash"], "out">;

type InState<TSpec extends RouteSpec> = IsAny<TSpec["state"]> extends true
  ? any
  : TSpec["state"] extends StateObjectConstraint
  ? Readable<PartialWithUndefined<RawStateParams<TSpec["state"], "in">>>
  : TSpec["state"] extends StateUnknownConstraint
  ? RawState<TSpec["state"], "in">
  : never;

type OutState<TSpec extends RouteSpec> = TSpec["state"] extends StateObjectConstraint
  ? Readable<UndefinedToPartial<RawStateParams<TSpec["state"], "out">>>
  : TSpec["state"] extends StateUnknownConstraint
  ? RawState<TSpec["state"], "out">
  : never;

type InferredPathnameParams<TPath extends PathConstraint> = Merge<
  Record<PathParam<TPath>, PathnameType<string>>,
  Record<PathParam<TPath, "optional">, PathnameType<string | undefined>>
>;

type RawParams<TPathnameParams extends PathnameParamsConstraint, TMode extends "in" | "out"> = {
  [TKey in keyof TPathnameParams]: TPathnameParams[TKey] extends PathnameType<infer TOut, infer TIn>
    ? TMode extends "in"
      ? Exclude<TIn, undefined>
      : TOut
    : never;
};

type RawSearchParams<TSearchParams extends SearchParamsConstraint, TMode extends "in" | "out"> = {
  [TKey in keyof TSearchParams]: TSearchParams[TKey] extends SearchType<infer TOut, infer TIn>
    ? TMode extends "in"
      ? Exclude<TIn, undefined>
      : TOut
    : never;
};

type RawState<TState extends StateUnknownConstraint, TMode extends "in" | "out"> = TState extends StateType<
  infer TOut,
  infer TIn
>
  ? TMode extends "in"
    ? Exclude<TIn, undefined>
    : TOut
  : never;

type RawHash<THash, TMode extends "in" | "out"> = THash extends string[]
  ? TMode extends "in"
    ? [THash[number]] extends [never]
      ? undefined
      : THash[number]
    : THash[number] | undefined
  : THash extends HashType<infer TOut, infer TIn>
  ? TMode extends "in"
    ? Exclude<TIn, undefined>
    : TOut
  : undefined;

type RawStateParams<TState extends StateObjectConstraint, TMode extends "in" | "out"> = {
  [TKey in keyof TState]: TState[TKey] extends StateType<infer TOut, infer TIn>
    ? TMode extends "in"
      ? Exclude<TIn, undefined>
      : TOut
    : never;
};

type AbsolutePath<T extends PathConstraint> = T extends string ? `/${T}` : T;

type PathWithoutIntermediateStars<T extends PathConstraint> = T extends `${infer TStart}*?/${infer TEnd}`
  ? PathWithoutIntermediateStars<`${TStart}${TEnd}`>
  : T extends `${infer TStart}*/${infer TEnd}`
  ? PathWithoutIntermediateStars<`${TStart}${TEnd}`>
  : T;

type SanitizePath<T> = T extends `/${string}`
  ? ErrorMessage<"Leading slashes are forbidden">
  : T extends `${string}/`
  ? ErrorMessage<"Trailing slashes are forbidden">
  : T;

type SanitizeRouteChildren<T> = Readable<{
  [TKey in keyof T]: TKey extends Omit$<TKey>
    ? T[TKey] extends RouteApi
      ? T[TKey]
      : RouteApi
    : ErrorMessage<"Name can't start with $">;
}>;

type SanitizePathnameTypes<TPath extends PathConstraint, TPathnameParams> = {
  [TKey in keyof TPathnameParams]: TKey extends PathParam<TPath>
    ? TPathnameParams[TKey] extends undefined
      ? PathnameType<any>
      : TPathnameParams[TKey]
    : ErrorMessage<"There is no such param in path">;
};

type Omit$<T> = T extends `$${infer TValid}` ? TValid : T;

type PathParam<
  TPath extends PathConstraint,
  TKind extends "all" | "optional" = "all",
  TMode extends "in" | "out" = "out",
> = string extends TPath
  ? never
  : TPath extends `${infer TBefore}*?${infer TAfter}`
  ?
      | ExtractPathParam<"*?", TKind, TMode, TAfter extends "" ? true : false>
      | PathParam<TBefore, TKind, TMode>
      | PathParam<TAfter, TKind, TMode>
  : TPath extends `${infer TBefore}*${infer TAfter}`
  ?
      | ExtractPathParam<"*", TKind, TMode, TAfter extends "" ? true : false>
      | PathParam<TBefore, TKind, TMode>
      | PathParam<TAfter, TKind, TMode>
  : TPath extends `${infer _TStart}:${infer TParam}/${infer TRest}`
  ? ExtractPathParam<TParam, TKind, TMode> | PathParam<TRest, TKind, TMode>
  : TPath extends `${infer _TStart}:${infer TParam}`
  ? ExtractPathParam<TParam, TKind, TMode>
  : never;

type ExtractPathParam<
  TRawParam extends string,
  TKind extends "all" | "optional" = "all",
  TMode extends "in" | "out" = "out",
  TEnd extends boolean = false,
> = TRawParam extends `${infer TParam}?`
  ? OmitIllegalStar<TParam, TMode, TEnd>
  : TKind extends "optional"
  ? TRawParam extends "*"
    ? TMode extends "in"
      ? OmitIllegalStar<TRawParam, TMode, TEnd>
      : never
    : never
  : OmitIllegalStar<TRawParam, TMode, TEnd>;

type OmitIllegalStar<
  TParam extends string,
  TMode extends "in" | "out" = "out",
  TEnd extends boolean = false,
> = TParam extends "*" ? (TMode extends "in" ? (TEnd extends false ? never : TParam) : TParam) : TParam;

interface CreateRouteOptions {
  createSearchParams: (init?: Record<string, string | string[]> | URLSearchParams) => URLSearchParams;
  generatePath: (path: string, params?: PathnameParams) => string;
}

interface RouteSpec<
  TPath extends PathConstraint = PathConstraint,
  TPathnameParams extends PathnameParamsConstraint = any,
  TSearchParams extends SearchParamsConstraint = any,
  THash extends HashConstraint = HashConstraint,
  TState extends StateConstraint = any,
> {
  path: TPath;
  params: TPathnameParams;
  searchParams: TSearchParams;
  hash: THash;
  state: TState;
}

type PathConstraint = string | undefined;

type PathnameParamsConstraint = Record<string, PathnameType<any>>;

type SearchParamsConstraint = Record<string, SearchType<any>>;

type StateConstraint = StateObjectConstraint | StateUnknownConstraint;

type StateObjectConstraint = Record<string, StateType<any>>;

type StateUnknownConstraint = StateType<any>;

type HashConstraint<T extends string = string> = T[] | HashType<any>;

type ExtractRouteSpecList<TTuple extends [...RouteApi[]]> = {
  [TIndex in keyof TTuple]: TTuple[TIndex]["$spec"];
};

type MergeRouteSpecList<T extends RouteSpec[], TMode extends "inherit" | "compose"> = T extends [
  infer TFirst,
  infer TSecond,
  ...infer TRest,
]
  ? TRest extends RouteSpec[]
    ? MergeRouteSpecList<[MergeRouteSpecPair<TFirst, TSecond, TMode>, ...TRest], TMode>
    : never
  : T extends [infer TFirst]
  ? TFirst extends RouteSpec
    ? TFirst
    : never
  : never;

type MergeRouteSpecPair<T, U, TMode extends "inherit" | "compose"> = T extends RouteSpec<
  infer TPath,
  infer TPathnameParams,
  infer TSearchParams,
  infer THash,
  infer TState
>
  ? U extends RouteSpec<
      infer TChildPath,
      infer TChildPathnameParams,
      infer TChildSearchParams,
      infer TChildHash,
      infer TChildState
    >
    ? RouteSpec<
        TMode extends "inherit"
          ? StringPath<TPath> extends ""
            ? TChildPath
            : StringPath<TChildPath> extends ""
            ? TPath
            : `${TPath}/${TChildPath}`
          : TChildPath,
        Merge<TPathnameParams, TChildPathnameParams>,
        Merge<TSearchParams, TChildSearchParams>,
        TChildHash extends string[] ? (THash extends string[] ? [...THash, ...TChildHash] : THash) : TChildHash,
        TChildState extends StateObjectConstraint
          ? TState extends StateObjectConstraint
            ? Merge<TState, TChildState>
            : TState
          : TChildState
      >
    : never
  : never;

type StringPath<T extends PathConstraint> = T extends undefined ? "" : T;

type OmitPath<T extends RouteSpec> = T extends RouteSpec<
  infer _TPath,
  infer TPathnameParams,
  infer TSearchParams,
  infer THash,
  infer TState
>
  ? RouteSpec<"", TPathnameParams, TSearchParams, THash, TState>
  : never;

type Merge<T, U> = Readable<Omit<T, keyof U> & U>;

type Readable<T> = T extends object ? (T extends infer O ? { [K in keyof O]: O[K] } : never) : T;

type ErrorMessage<T extends string> = T & { [brand]: ErrorMessage<T> };

declare const brand: unique symbol;

type IsAny<T> = 0 extends 1 & T ? true : false;

type UndefinedToPartial<T> = Merge<T, Undefined<T>>;

type Undefined<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<T[K], undefined>;
};

type PartialWithUndefined<T> = {
  [K in keyof T]?: T[K] | undefined;
};

type NormalizePathnameParams<TPathnameParams, TPath extends PathConstraint> = Partial<
  Record<PathParam<TPath>, PathnameType<any>>
> extends TPathnameParams
  ? {}
  : Readable<RequiredWithoutUndefined<TPathnameParams>>;

type RequiredWithoutUndefined<T> = {
  [P in keyof T]-?: Exclude<T[P], undefined>;
};

/**
 * Internal helper for creating the `route` helper. Most likely, you should import `route` from a platform-specific
 * entry point instead of using this helper.
 */
function createRoute(creatorOptions: CreateRouteOptions) {
  function route<
    TPath extends PathConstraint = undefined,
    // We actually want {} by default, but it breaks autocomplete for some reason.
    TPathnameParams extends Partial<Record<PathParam<TPath>, PathnameType<any>>> = Partial<
      Record<PathParam<TPath>, PathnameType<any>>
    >,
    TSearchParams extends SearchParamsConstraint = {},
    // Allows to infer hash values from array without const.
    THashString extends string = string,
    THash extends HashConstraint<THashString> = [],
    TState extends StateConstraint = {},
    // Only allow to compose pathless routes
    TComposedRoutes extends [...RouteApi<RouteSpec<undefined>>[]] = [],
    // This should be restricted to Record<string, BaseRoute>, but it breaks types for nested routes,
    // even without names validity check
    TChildren = {},
  >(opts: {
    /**
     * A path pattern, just like in React Router. The only difference is that leading and trailing slashes are
     * forbidden.
     */
    path?: SanitizePath<TPath>;
    // Forbid undefined values and non-existent keys (but allow all keys for pathless routes)
    /**
     * Pathname params. Use a record of types to override params
     * inferred from `path`, partially or completely:
     *
     * ```ts
     * params: { id: number() }
     * ```
     *
     * If there is no `path`, you can specify any params.
     *
     * */
    params?: TPath extends undefined ? PathnameParamsConstraint : SanitizePathnameTypes<TPath, TPathnameParams>;
    /**
     * Search params. Use a record of types to define them:
     *
     * ```ts
     * searchParams: { page: number() }
     * ```
     * */
    searchParams?: TSearchParams;
    /**
     * Hash. Use a type to define it:
     *
     * ```ts
     * hash: union(["info", "stats"])
     * ```
     *
     * If you want to extend it in a child route, specify it as an array of string values instead:
     *
     * ```ts
     * hash: ["info", "stats"]
     * ```
     */
    hash?: THash;
    /**
     * State. Use a record of types to define it:
     *
     * ```ts
     * state: { expired: boolean() }
     * ```
     *
     * As an escape hatch, you can use a single type (not recommended):
     *
     * ```ts
     * state: boolean()
     * ```
     */
    state?: TState;
    /** An array of pathless routes whose params will be composed into the route. */
    compose?: [...TComposedRoutes];
    /** Child routes that will inherit all params. */
    children?: SanitizeRouteChildren<TChildren>;
  }): Route<
    MergeRouteSpecList<
      [
        ...ExtractRouteSpecList<TComposedRoutes>,
        RouteSpec<TPath, NormalizePathnameParams<TPathnameParams, TPath>, TSearchParams, THash, TState>,
      ],
      "compose"
    >,
    SanitizeRouteChildren<TChildren>
  > {
    const composedSpecList = (opts.compose ?? []).map(({ $spec }) => $spec) as ExtractRouteSpecList<TComposedRoutes>;

    const ownSpec = {
      path: opts.path,
      params: opts?.params ?? {},
      searchParams: opts?.searchParams ?? {},
      hash: opts?.hash ?? [],
      state: opts?.state ?? {},
    };

    const resolvedSpec = mergeSpecList([...composedSpecList, ownSpec], "compose");

    return {
      ...decorateChildren(resolvedSpec, creatorOptions, opts.children),
      ...getRoute(resolvedSpec, creatorOptions),
      $: decorateChildren(omitPath(resolvedSpec), creatorOptions, opts.children),
    };
  }

  return route;
}

function omitPath<
  TPath extends PathConstraint,
  TPathnameParams extends PathnameParamsConstraint,
  TSearchParams extends SearchParamsConstraint,
  THash extends HashConstraint,
  TState extends StateConstraint,
>(
  spec: RouteSpec<TPath, TPathnameParams, TSearchParams, THash, TState>,
): OmitPath<RouteSpec<TPath, TPathnameParams, TSearchParams, THash, TState>> {
  return {
    ...spec,
    path: "",
  };
}

function mergeSpecList<T extends [...RouteSpec[]], TMode extends "compose" | "inherit">(
  specList: [...T],
  mode: TMode,
): MergeRouteSpecList<T, TMode> {
  return specList.reduce((acc, item) => {
    return {
      path:
        mode === "compose"
          ? item.path
          : ["", undefined].includes(acc.path)
          ? item.path
          : ["", undefined].includes(item.path)
          ? acc.path
          : `${acc.path}/${item.path}`,
      params: { ...acc.params, ...item.params },
      searchParams: { ...acc.searchParams, ...item.searchParams },
      hash: isHashType(item.hash)
        ? item.hash
        : isHashType(acc.hash)
        ? acc.hash
        : [...(acc.hash || []), ...(item.hash || [])],
      state: { ...acc.state, ...item.state },
    };
  }) as MergeRouteSpecList<T, TMode>;
}

function isHashType<T extends HashType<any>>(value: T | string[] | undefined): value is T {
  return Boolean(value) && !Array.isArray(value);
}

function decorateChildren<TSpec extends RouteSpec, TChildren>(
  spec: TSpec,
  creatorOptions: CreateRouteOptions,
  children: TChildren | undefined,
): RouteChildren<TSpec, TChildren> {
  const result: Record<string, unknown> = {};

  if (children) {
    Object.keys(children).forEach((key) => {
      // Explicit unknown is required for the type guard to work in TS 5.1 for some reason
      const value: unknown = children[key as keyof typeof children];

      result[key] = isRoute(value)
        ? {
            ...decorateChildren(spec, creatorOptions, value),
            ...getRoute(mergeSpecList([spec, value.$spec], "inherit"), creatorOptions),
            $: decorateChildren(omitPath(spec), creatorOptions, value.$),
          }
        : value;
    });
  }

  return result as RouteChildren<TSpec, TChildren>;
}

function getRoute<
  TSpec extends RouteSpec<
    PathConstraint,
    PathnameParamsConstraint,
    SearchParamsConstraint,
    HashConstraint,
    StateConstraint
  >,
>(spec: TSpec, creatorOptions: CreateRouteOptions): RouteApi<TSpec> {
  const [allPathParams] = getPathParams(spec.path as TSpec["path"]);
  const relativePath = removeIntermediateStars(spec.path as TSpec["path"]);
  const resolvedTypes = { ...spec, params: { ...getInferredPathnameTypes(spec.path), ...spec.params } };

  function getPlainParams(opts: BuildPathnameOptions<TSpec>) {
    return getPlainParamsByTypes(allPathParams, opts.params, spec.params);
  }

  function buildPathname(opts: BuildPathnameOptions<TSpec>) {
    const rawBuiltPath = creatorOptions.generatePath(relativePath ?? "", getPlainParams(opts));
    const relativePathname = rawBuiltPath.startsWith("/") ? rawBuiltPath.substring(1) : rawBuiltPath;

    return `${opts?.relative ? "" : "/"}${relativePathname}`;
  }

  function buildPath(opts: BuildPathOptions<TSpec>) {
    const params = opts.params ?? ({} as InPathnameParams<TSpec>);
    const searchParams = opts.searchParams ?? ({} as InSearchParams<TSpec>);
    const hash = opts.hash;

    return `${buildPathname({ params, ...opts })}${buildSearch({ searchParams, ...opts })}${
      hash !== undefined ? buildHash({ hash }) : ""
    }`;
  }

  function getPlainSearchParams(opts: BuildSearchOptions<TSpec>) {
    const plainParams = creatorOptions.createSearchParams(
      getPlainSearchParamsByTypes(opts.searchParams, spec.searchParams),
    );

    if (opts?.untypedSearchParams) {
      appendSearchParams(plainParams, getUntypedSearchParams(opts?.untypedSearchParams));
    }

    return plainParams;
  }

  function buildSearch(opts: BuildSearchOptions<TSpec>) {
    const searchString = creatorOptions.createSearchParams(getPlainSearchParams(opts)).toString();

    return searchString ? `?${searchString}` : "";
  }

  function buildHash(opts: BuildHashOptions<TSpec>) {
    if (isHashType(spec.hash)) {
      return `#${spec.hash.getPlainHash(opts.hash)}`;
    }
    return `#${String(opts.hash)}`;
  }

  function buildState(opts: BuildStateOptions<TSpec>) {
    return (
      isStateType(spec.state)
        ? getPlainStateByType(opts.state, spec.state)
        : Object.assign(getPlainStateParamsByTypes(opts.state, spec.state), getUntypedState(opts?.untypedState))
    ) as PlainState<TSpec["state"]>;
  }

  function getTypedParams(params: PathnameParams) {
    return getTypedParamsByTypes(params, resolvedTypes, allPathParams);
  }

  function getTypedSearchParams(params: URLSearchParams) {
    return getTypedSearchParamsByTypes(params, spec);
  }

  function getUntypedSearchParams(params: URLSearchParams) {
    const result = creatorOptions.createSearchParams(params);

    if (!spec.searchParams) return result;

    Object.keys(spec.searchParams).forEach((key) => {
      result.delete(key);
    });

    return result;
  }

  function getTypedState(state: unknown) {
    return getTypedStateByTypes(state, spec);
  }

  function getUntypedState(state: unknown) {
    const result = (isStateType(spec.state) ? undefined : {}) as UntypedPlainState<TSpec["state"]>;

    if (!isRecord(state) || !result) return result;

    const typedKeys = spec.state ? Object.keys(spec.state) : [];

    Object.keys(state).forEach((key) => {
      if (typedKeys.indexOf(key) === -1) {
        result[key] = state[key];
      }
    });

    return result;
  }

  function getTypedHash(hash: string): OutHash<TSpec> {
    const normalizedHash = hash?.substring(1, hash?.length);

    if (isHashType(spec.hash)) {
      return spec.hash.getTypedHash(normalizedHash);
    }

    if (normalizedHash && spec.hash.indexOf(normalizedHash) !== -1) {
      return normalizedHash as OutHash<TSpec>;
    }

    return undefined as OutHash<TSpec>;
  }

  return {
    $path: makeAbsolute(spec.path as TSpec["path"]),
    $relativePath: relativePath,
    $buildPath: buildPath,
    $buildPathname: buildPathname,
    $buildPathnameParams: getPlainParams,
    $buildSearch: buildSearch,
    $buildSearchParams: getPlainSearchParams,
    $buildHash: buildHash,
    $buildState: buildState,
    $validateParams: getTypedParams,
    $validateSearchParams: getTypedSearchParams,
    $validateHash: getTypedHash,
    $validateState: getTypedState,
    $spec: spec,
  };
}

function getInferredPathnameTypes<T extends PathConstraint>(path: T): InferredPathnameParams<T> {
  const [allPathParams, optionalPathParams] = getPathParams(path);

  const params: Record<string, PathnameType<any>> = {};

  optionalPathParams.forEach((optionalParam) => {
    params[optionalParam] = string();
  });

  allPathParams.forEach((param) => {
    if (!params[param]) {
      params[param] = string().defined();
    }
  });

  return params as InferredPathnameParams<T>;
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

function getTypedParamsByTypes<
  TSpec extends RouteSpec<
    PathConstraint,
    PathnameParamsConstraint,
    SearchParamsConstraint,
    HashConstraint,
    StateConstraint
  >,
>(params: PathnameParams, spec: TSpec, keys: PathParam<TSpec["path"]>[]): OutPathnameParams<TSpec> {
  const types = spec.params;

  const result: Record<string, unknown> = {};

  Object.keys(types).forEach((key) => {
    const type = types[key];

    if (type && keys.includes(key as PathParam<TSpec["path"]>)) {
      const typedSearchParam = type.getTypedParam(params[key]);
      if (typedSearchParam !== undefined) {
        result[key] = typedSearchParam;
      }
    }
  });

  return result as OutPathnameParams<TSpec>;
}

function getTypedSearchParamsByTypes<
  TSpec extends RouteSpec<
    PathConstraint,
    PathnameParamsConstraint,
    SearchParamsConstraint,
    HashConstraint,
    StateConstraint
  >,
>(searchParams: URLSearchParams, spec: TSpec): OutSearchParams<TSpec> {
  const result: Record<string, unknown> = {};
  const types = spec.searchParams;

  Object.keys(types).forEach((key) => {
    const type = types[key];

    if (type) {
      const typedSearchParam = type.getTypedSearchParam(searchParams.getAll(key));
      if (typedSearchParam !== undefined) {
        result[key] = typedSearchParam;
      }
    }
  });

  return result as OutSearchParams<TSpec>;
}

function getTypedStateByTypes<
  TSpec extends RouteSpec<
    PathConstraint,
    PathnameParamsConstraint,
    SearchParamsConstraint,
    HashConstraint,
    StateConstraint
  >,
>(state: unknown, spec: TSpec): OutState<TSpec> {
  if (isStateType(spec.state)) {
    return spec.state.getTypedState(state);
  }

  const result: Record<string, unknown> = {};
  const types = spec.state;

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

  return result as OutState<TSpec>;
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

function isRoute(value: unknown): value is Route<RouteSpec, unknown> {
  return Boolean(value && typeof value === "object" && "$spec" in value);
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
  RouteApi,
  RouteChildren,
  RouteSpec,
  PathParam,
  SanitizePath,
  SanitizeRouteChildren,
  InPathnameParams,
  OutPathnameParams,
  InSearchParams,
  OutSearchParams,
  InHash,
  OutHash,
  InState,
  OutState,
  ErrorMessage,
};
