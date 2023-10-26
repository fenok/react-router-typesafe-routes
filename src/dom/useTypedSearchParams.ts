import { BaseRoute, RouteOptions, InSearchParams, OutSearchParams, InState } from "../common/index.js";
import { useSearchParams, NavigateOptions } from "react-router-dom";
import { useMemo, useCallback } from "react";

interface TypedNavigateOptions<T> extends NavigateOptions {
  state?: T;
  untypedSearchParams?: boolean;
}

function useTypedSearchParams<TOptions extends RouteOptions>(
  route: BaseRoute<TOptions>,
  typedDefaultInit?: InSearchParams<TOptions>,
): [
  OutSearchParams<TOptions>,
  (
    searchParams: InSearchParams<TOptions> | ((prevParams: OutSearchParams<TOptions>) => InSearchParams<TOptions>),
    navigateOptions?: TypedNavigateOptions<InState<TOptions["state"]>>,
  ) => void,
] {
  const defaultInit = useMemo(
    () => (typedDefaultInit ? route.$getPlainSearchParams(typedDefaultInit) : undefined),
    [route, typedDefaultInit],
  );

  const [searchParams, setSearchParams] = useSearchParams(defaultInit);

  const typedSearchParams = useMemo(() => route.$getTypedSearchParams(searchParams), [route, searchParams]);

  const setTypedSearchParams = useCallback(
    (
      params: InSearchParams<TOptions> | ((prevParams: OutSearchParams<TOptions>) => InSearchParams<TOptions>),
      { state, untypedSearchParams, ...restNavigateOptions }: TypedNavigateOptions<InState<TOptions["state"]>> = {},
    ) => {
      setSearchParams(
        (prevParams) => {
          return route.$getPlainSearchParams(
            typeof params === "function" ? params(route.$getTypedSearchParams(prevParams)) : params,
            { untypedSearchParams: untypedSearchParams ? prevParams : undefined },
          );
        },
        {
          ...(state ? { state: route.$buildState(state) } : {}),
          ...restNavigateOptions,
        },
      );
    },
    [route, setSearchParams],
  );

  return [typedSearchParams, setTypedSearchParams];
}

export { useTypedSearchParams, TypedNavigateOptions };
