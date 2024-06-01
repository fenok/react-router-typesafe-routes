import { PathnameType, SearchType, StateType, HashType, Type, DefType, string } from "../types/index.js";

/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */

type Route<
  TOptions extends RouteOptions = RouteOptions<PathConstraint, any, any, any>,
  TChildren = {},
> = DecorateChildren<TOptions, TChildren> &
  BaseRoute<TOptions> & {
    $: DecorateChildren<OmitPathname<TOptions>, TChildren>;
  };

type DecorateChildren<TOptions extends RouteOptions, TChildren> = {
  [TKey in keyof TChildren]: TChildren[TKey] extends Route<infer TChildOptions, infer TChildChildren>
    ? Route<MergeOptions<[TOptions, TChildOptions], "inherit">, TChildChildren>
    : TChildren[TKey];
};

interface BaseRoute<TOptions extends RouteOptions = RouteOptions<PathConstraint, any, any, any>> {
  $path: AbsolutePath<TOptions["path"]>;
  $relativePath: PathWithoutIntermediateStars<TOptions["path"]>;
  $buildPath: (opts: PathBuilderOptions<TOptions>) => string;
  $buildPathname: (params: InPathnameParams<TOptions>, opts?: PathnameBuilderOptions) => string;
  $buildSearch: (searchParams: InSearchParams<TOptions>, opts?: SearchBuilderOptions) => string;
  $buildState: (state: InState<TOptions>, opts?: StateBuilderOptions) => PlainState<TOptions["state"]>;
  $buildHash: (hash: InHash<TOptions>) => string;
  $getTypedParams: (params: Record<string, string | undefined>) => OutPathnameParams<TOptions>;
  $getTypedSearchParams: (searchParams: URLSearchParams) => OutSearchParams<TOptions>;
  $getTypedState: (state: unknown) => OutState<TOptions>;
  $getTypedHash: (hash: string) => OutHash<TOptions>;
  $getUntypedParams: (params: Record<string, string | undefined>) => Record<string, string | undefined>;
  $getUntypedSearchParams: (searchParams: URLSearchParams) => URLSearchParams;
  $getUntypedState: (state: unknown) => UntypedPlainState<TOptions["state"]>;
  $getPlainParams: (params: InPathnameParams<TOptions>) => Record<string, string | undefined>;
  $getPlainSearchParams: (searchParams: InSearchParams<TOptions>, opts?: SearchBuilderOptions) => URLSearchParams;
  $options: TOptions;
}

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

type InPathParams<TOptions extends RouteOptions> = Readable<
  (PathnameParamsRequired<InPathnameParams<TOptions>> extends true
    ? { params: InPathnameParams<TOptions> }
    : { params?: InPathnameParams<TOptions> }) & {
    searchParams?: InSearchParams<TOptions>;
    hash?: InHash<TOptions>;
  }
>;

type PathnameParamsRequired<T> = Partial<T> extends T ? (IsAny<T> extends true ? true : false) : true;

type InPathnameParams<TOptions extends RouteOptions> = Merge<
  InferredPathnameTypes<TOptions["path"]>,
  TOptions["params"]
> extends infer TResolvedTypes
  ? TResolvedTypes extends PathnameTypesConstraint
    ? IsAny<TResolvedTypes> extends true
      ? any
      : Merge<
          Pick<RawParams<TResolvedTypes, "in">, PathParam<TOptions["path"], "all", "in">>,
          Partial<Pick<RawParams<TResolvedTypes, "in">, PathParam<TOptions["path"], "optional", "in">>>
        >
    : never
  : never;

type OutPathnameParams<TOptions extends RouteOptions> = Merge<
  InferredPathnameTypes<TOptions["path"]>,
  TOptions["params"]
> extends infer TResolvedTypes
  ? TResolvedTypes extends PathnameTypesConstraint
    ? Readable<
        PartialUndefined<
          undefined extends TOptions["path"]
            ? RawParams<TResolvedTypes, "out">
            : Pick<RawParams<TResolvedTypes, "out">, PathParam<TOptions["path"]>>
        >
      >
    : never
  : never;

type InSearchParams<TOptions extends RouteOptions> = IsAny<TOptions["searchParams"]> extends true
  ? any
  : Readable<Partial<RawSearchParams<TOptions["searchParams"], "in">>>;

type OutSearchParams<TOptions extends RouteOptions> = Readable<
  PartialUndefined<RawSearchParams<TOptions["searchParams"], "out">>
>;

type InState<TOptions extends RouteOptions> = IsAny<TOptions["state"]> extends true
  ? any
  : TOptions["state"] extends StateTypesObjectConstraint
  ? Readable<Partial<RawStateParams<TOptions["state"], "in">>>
  : TOptions["state"] extends StateTypesUnknownConstraint
  ? RawState<TOptions["state"], "in">
  : never;

type OutState<TOptions extends RouteOptions> = TOptions["state"] extends StateTypesObjectConstraint
  ? Readable<PartialUndefined<RawStateParams<TOptions["state"], "out">>>
  : TOptions["state"] extends StateTypesUnknownConstraint
  ? RawState<TOptions["state"], "out">
  : never;

type InHash<TOptions extends RouteOptions> = RawHash<TOptions["hash"], "in">;

type OutHash<TOptions extends RouteOptions> = RawHash<TOptions["hash"], "out">;

type InferredPathnameTypes<TPath extends PathConstraint> = Merge<
  Record<PathParam<TPath>, DefType<string>>,
  Record<PathParam<TPath, "optional">, Type<string>>
>;

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
    ? [THash[number]] extends [never]
      ? undefined
      : THash[number]
    : THash[number] | undefined
  : THash extends HashType<infer TOut, infer TIn>
  ? TMode extends "in"
    ? Exclude<TIn, undefined>
    : TOut
  : undefined;

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

type SanitizeChildren<T> = Readable<{
  [TKey in keyof T]: TKey extends Omit$<TKey>
    ? T[TKey] extends BaseRoute
      ? T[TKey]
      : BaseRoute
    : ErrorMessage<"Name can't start with $">;
}>;

type SanitizePathnameTypes<TPath extends PathConstraint, TPathnameTypes> = {
  [TKey in keyof TPathnameTypes]: TKey extends PathParam<TPath>
    ? TPathnameTypes[TKey] extends undefined
      ? PathnameType<any>
      : TPathnameTypes[TKey]
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
  : TPath extends `${infer TStart}:${infer TParam}/${infer TRest}`
  ? ExtractPathParam<TParam, TKind, TMode> | PathParam<TRest, TKind, TMode>
  : TPath extends `${infer TStart}:${infer TParam}`
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
  generatePath: (path: string, params?: Record<string, string | undefined>) => string;
}

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

type PathConstraint = string | undefined;

type PathnameTypesConstraint = Record<string, PathnameType<any>>;

type SearchTypesConstraint = Record<string, SearchType<any>>;

type StateTypesConstraint = StateTypesObjectConstraint | StateTypesUnknownConstraint;

type StateTypesObjectConstraint = Record<string, StateType<any>>;

type StateTypesUnknownConstraint = StateType<any>;

type HashTypesConstraint<T extends string = string> = T[] | HashType<any>;

type ExtractOptions<TTuple extends [...BaseRoute[]]> = {
  [TIndex in keyof TTuple]: TTuple[TIndex]["$options"];
};

type MergeOptions<T extends RouteOptions[], TMode extends "inherit" | "compose"> = T extends [
  infer TFirst,
  infer TSecond,
  ...infer TRest,
]
  ? TRest extends RouteOptions[]
    ? MergeOptions<[MergeOptionsPair<TFirst, TSecond, TMode>, ...TRest], TMode>
    : never
  : T extends [infer TFirst]
  ? TFirst extends RouteOptions
    ? TFirst
    : never
  : never;

type MergeOptionsPair<T, U, TMode extends "inherit" | "compose"> = T extends RouteOptions<
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
        Merge<TPathnameTypes, TChildPathTypes>,
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

type StringPath<T extends PathConstraint> = T extends undefined ? "" : T;

type OmitPathname<T extends RouteOptions> = T extends RouteOptions<
  infer _TPath,
  infer _TPathnameTypes,
  infer TSearchTypes,
  infer TStateTypes,
  infer THash
>
  ? RouteOptions<"", {}, TSearchTypes, TStateTypes, THash>
  : never;

type Merge<T, U> = Readable<Omit<T, keyof U> & U>;

type Readable<T> = T extends object ? (T extends infer O ? { [K in keyof O]: O[K] } : never) : T;

type ErrorMessage<T extends string> = T & { [brand]: ErrorMessage<T> };

declare const brand: unique symbol;

type IsAny<T> = 0 extends 1 & T ? true : false;

type PartialUndefined<T> = Merge<T, Undefined<T>>;

type Undefined<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K];
};

type NormalizePathnameTypes<TTypes, TPath extends PathConstraint> = Partial<
  Record<PathParam<TPath>, PathnameType<any>>
> extends TTypes
  ? {}
  : Readable<RequiredWithoutUndefined<TTypes>>;

type RequiredWithoutUndefined<T> = {
  [P in keyof T]-?: Exclude<T[P], undefined>;
};

function createRoute(creatorOptions: CreateRouteOptions) {
  function route<
    TPath extends PathConstraint = undefined,
    // We actually want {} by default, but it breaks autocomplete for some reason.
    TPathnameTypes extends Partial<Record<PathParam<TPath>, PathnameType<any>>> = Partial<
      Record<PathParam<TPath>, PathnameType<any>>
    >,
    TSearchTypes extends SearchTypesConstraint = {},
    TStateTypes extends StateTypesConstraint = {},
    // Allows to infer hash values from array without const.
    THashString extends string = string,
    THash extends HashTypesConstraint<THashString> = [],
    // Only allow to compose pathless routes
    TComposedRoutes extends [...BaseRoute<RouteOptions<undefined, any, any, any>>[]] = [],
    // This should be restricted to Record<string, BaseRoute>, but it breaks types for nested routes,
    // even without names validity check
    TChildren = {},
  >(opts: {
    path?: SanitizePath<TPath>;
    compose?: [...TComposedRoutes];
    // Forbid undefined values and non-existent keys (but allow all keys for pathless routes)
    params?: TPath extends undefined ? PathnameTypesConstraint : SanitizePathnameTypes<TPath, TPathnameTypes>;
    searchParams?: TSearchTypes;
    state?: TStateTypes;
    hash?: THash;
    children?: SanitizeChildren<TChildren>;
  }): Route<
    MergeOptions<
      [
        ...ExtractOptions<TComposedRoutes>,
        RouteOptions<TPath, NormalizePathnameTypes<TPathnameTypes, TPath>, TSearchTypes, TStateTypes, THash>,
      ],
      "compose"
    >,
    SanitizeChildren<TChildren>
  > {
    const composedOptions = (opts.compose ?? []).map(({ $options }) => $options) as ExtractOptions<TComposedRoutes>;

    const ownOptions = {
      path: opts.path,
      params: opts?.params ?? {},
      searchParams: opts?.searchParams ?? {},
      state: opts?.state ?? {},
      hash: opts?.hash ?? [],
    };

    const resolvedOptions = mergeOptions([...composedOptions, ownOptions], "compose");

    return {
      ...decorateChildren(resolvedOptions, creatorOptions, opts.children),
      ...getRoute(resolvedOptions, creatorOptions),
      $: decorateChildren(omitPathnameTypes(resolvedOptions), creatorOptions, opts.children),
    };
  }

  return route;
}

function omitPathnameTypes<
  TPath extends PathConstraint,
  TPathnameTypes extends PathnameTypesConstraint,
  TSearchTypes extends SearchTypesConstraint,
  TStateTypes extends StateTypesConstraint,
  THash extends HashTypesConstraint,
>(
  options: RouteOptions<TPath, TPathnameTypes, TSearchTypes, TStateTypes, THash>,
): OmitPathname<RouteOptions<TPath, TPathnameTypes, TSearchTypes, TStateTypes, THash>> {
  return {
    ...options,
    path: "",
    params: {},
  };
}

function mergeOptions<T extends [...RouteOptions[]], TMode extends "compose" | "inherit">(
  optionsArray: [...T],
  mode: TMode,
): MergeOptions<T, TMode> {
  return optionsArray.reduce((acc, item) => {
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
  }) as MergeOptions<T, TMode>;
}

function isHashType<T extends HashType<any>>(value: T | string[] | undefined): value is T {
  return Boolean(value) && !Array.isArray(value);
}

function decorateChildren<TOptions extends RouteOptions, TChildren>(
  options: TOptions,
  creatorOptions: CreateRouteOptions,
  children: TChildren | undefined,
): DecorateChildren<TOptions, TChildren> {
  const result: Record<string, unknown> = {};

  if (children) {
    Object.keys(children).forEach((key) => {
      // Explicit unknown is required for the type guard to work in TS 5.1 for some reason
      const value: unknown = children[key as keyof typeof children];

      result[key] = isRoute(value)
        ? {
            ...decorateChildren(options, creatorOptions, value),
            ...getRoute(mergeOptions([options, value.$options], "inherit"), creatorOptions),
            $: decorateChildren(omitPathnameTypes(options), creatorOptions, value.$),
          }
        : value;
    });
  }

  return result as DecorateChildren<TOptions, TChildren>;
}

function getRoute<TOptions extends RouteOptions>(
  options: TOptions,
  creatorOptions: CreateRouteOptions,
): BaseRoute<TOptions> {
  const [allPathParams] = getPathParams(options.path as TOptions["path"]);
  const relativePath = removeIntermediateStars(options.path as TOptions["path"]);
  const resolvedTypes = { ...options, params: { ...getInferredPathnameTypes(options.path), ...options.params } };

  function getPlainParams(params: InPathnameParams<TOptions>) {
    return getPlainParamsByTypes(allPathParams, params, options.params);
  }

  function buildPathname(params: InPathnameParams<TOptions>, opts?: PathnameBuilderOptions) {
    const rawBuiltPath = creatorOptions.generatePath(relativePath ?? "", getPlainParams(params));
    const relativePathname = rawBuiltPath.startsWith("/") ? rawBuiltPath.substring(1) : rawBuiltPath;

    return `${opts?.relative ? "" : "/"}${relativePathname}`;
  }

  function buildPath(opts: PathBuilderOptions<TOptions>) {
    const pathnameParams = opts.params ?? ({} as InPathnameParams<TOptions>);
    const searchParams = opts.searchParams ?? ({} as InSearchParams<TOptions>);
    const hash = opts.hash;

    return `${buildPathname(pathnameParams, opts)}${buildSearch(searchParams, opts)}${
      hash !== undefined ? buildHash(hash) : ""
    }`;
  }

  function getPlainSearchParams(params: InSearchParams<TOptions>, opts?: SearchBuilderOptions) {
    const plainParams = creatorOptions.createSearchParams(getPlainSearchParamsByTypes(params, options.searchParams));

    if (opts?.untypedSearchParams) {
      appendSearchParams(plainParams, getUntypedSearchParams(opts?.untypedSearchParams));
    }

    return plainParams;
  }

  function buildSearch(params: InSearchParams<TOptions>, opts?: SearchBuilderOptions) {
    const searchString = creatorOptions.createSearchParams(getPlainSearchParams(params, opts)).toString();

    return searchString ? `?${searchString}` : "";
  }

  function buildHash(hash: InHash<TOptions>) {
    if (isHashType(options.hash)) {
      return `#${options.hash.getPlainHash(hash)}`;
    }
    return `#${String(hash)}`;
  }

  function buildState(params: InState<TOptions>, opts?: StateBuilderOptions) {
    return (
      isStateType(options.state)
        ? getPlainStateByType(params, options.state)
        : Object.assign(getPlainStateParamsByTypes(params, options.state), getUntypedState(opts?.untypedState))
    ) as PlainState<TOptions["state"]>;
  }

  function getTypedParams(params: Record<string, string | undefined>) {
    return getTypedParamsByTypes(params, resolvedTypes, allPathParams);
  }

  function getUntypedParams(params: Record<string, string | undefined>) {
    const result: Record<string, string | undefined> = {};

    Object.keys(params).forEach((key) => {
      if (!resolvedTypes.params[key]) {
        result[key] = params[key];
      }
    });

    return result;
  }

  function getTypedSearchParams(params: URLSearchParams) {
    return getTypedSearchParamsByTypes(params, options);
  }

  function getUntypedSearchParams(params: URLSearchParams) {
    const result = creatorOptions.createSearchParams(params);

    if (!options.searchParams) return result;

    Object.keys(options.searchParams).forEach((key) => {
      result.delete(key);
    });

    return result;
  }

  function getTypedState(state: unknown) {
    return getTypedStateByTypes(state, options);
  }

  function getUntypedState(state: unknown) {
    const result = (isStateType(options.state) ? undefined : {}) as UntypedPlainState<TOptions["state"]>;

    if (!isRecord(state) || !result) return result;

    const typedKeys = options.state ? Object.keys(options.state) : [];

    Object.keys(state).forEach((key) => {
      if (typedKeys.indexOf(key) === -1) {
        result[key] = state[key];
      }
    });

    return result;
  }

  function getTypedHash(hash: string): OutHash<TOptions> {
    const normalizedHash = hash?.substring(1, hash?.length);

    if (isHashType(options.hash)) {
      return options.hash.getTypedHash(normalizedHash);
    }

    if (normalizedHash && options.hash.indexOf(normalizedHash) !== -1) {
      return normalizedHash as OutHash<TOptions>;
    }

    return undefined as OutHash<TOptions>;
  }

  return {
    $path: makeAbsolute(options.path as TOptions["path"]),
    $relativePath: relativePath,
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
    $options: options,
  };
}

function getInferredPathnameTypes<T extends PathConstraint>(path: T): InferredPathnameTypes<T> {
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

  return params as InferredPathnameTypes<T>;
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

function getTypedParamsByTypes<TOptions extends RouteOptions>(
  params: Record<string, string | undefined>,
  options: TOptions,
  keys: PathParam<TOptions["path"]>[],
): OutPathnameParams<TOptions> {
  const types = options.params;

  const result: Record<string, unknown> = {};

  Object.keys(types).forEach((key) => {
    const type = types[key];

    if (type && keys.includes(key as PathParam<TOptions["path"]>)) {
      const typedSearchParam = type.getTypedParam(params[key]);
      if (typedSearchParam !== undefined) {
        result[key] = typedSearchParam;
      }
    }
  });

  return result as OutPathnameParams<TOptions>;
}

function getTypedSearchParamsByTypes<TOptions extends RouteOptions>(
  searchParams: URLSearchParams,
  options: TOptions,
): OutSearchParams<TOptions> {
  const result: Record<string, unknown> = {};
  const types = options.searchParams;

  Object.keys(types).forEach((key) => {
    const type = types[key];

    if (type) {
      const typedSearchParam = type.getTypedSearchParam(searchParams.getAll(key));
      if (typedSearchParam !== undefined) {
        result[key] = typedSearchParam;
      }
    }
  });

  return result as OutSearchParams<TOptions>;
}

function getTypedStateByTypes<TOptions extends RouteOptions>(state: unknown, options: TOptions): OutState<TOptions> {
  if (isStateType(options.state)) {
    return options.state.getTypedState(state);
  }

  const result: Record<string, unknown> = {};
  const types = options.state;

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

  return result as OutState<TOptions>;
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
  return Boolean(value && typeof value === "object" && "$options" in value);
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
  DecorateChildren,
  RouteOptions,
  PathParam,
  SanitizePath,
  SanitizeChildren,
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
