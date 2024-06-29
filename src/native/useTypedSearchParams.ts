import { Route, RouteSpec, InSearchParams, OutSearchParams, InState } from "../common/index.js";
import { useSearchParams, NavigateOptions } from "react-router-native";
import { useMemo, useCallback } from "react";

interface TypedNavigateOptions<T> extends NavigateOptions {
  state?: T;
  untypedSearchParams?: boolean;
}

function useTypedSearchParams<TSpec extends RouteSpec>(
  route: Route<TSpec>,
  typedDefaultInit?: InSearchParams<TSpec>,
): [
  OutSearchParams<TSpec>,
  (
    searchParams: InSearchParams<TSpec> | ((prevParams: OutSearchParams<TSpec>) => InSearchParams<TSpec>),
    navigateOptions?: TypedNavigateOptions<InState<TSpec>>,
  ) => void,
] {
  const defaultInit = useMemo(
    () => (typedDefaultInit ? route.$buildSearchParams({ searchParams: typedDefaultInit }) : undefined),
    [route, typedDefaultInit],
  );

  const [searchParams, setSearchParams] = useSearchParams(defaultInit);

  const typedSearchParams = useMemo(() => route.$getTypedSearchParams(searchParams), [route, searchParams]);

  const setTypedSearchParams = useCallback(
    (
      params: InSearchParams<TSpec> | ((prevParams: OutSearchParams<TSpec>) => InSearchParams<TSpec>),
      { state, untypedSearchParams, ...restNavigateOptions }: TypedNavigateOptions<InState<TSpec>> = {},
    ) => {
      setSearchParams(
        (prevParams) => {
          return route.$buildSearchParams({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            searchParams: typeof params === "function" ? params(route.$getTypedSearchParams(prevParams)) : params,
            untypedSearchParams: untypedSearchParams ? prevParams : undefined,
          });
        },
        {
          ...(state ? { state: route.$buildState({ state }) } : {}),
          ...restNavigateOptions,
        },
      );
    },
    [route, setSearchParams],
  );

  return [typedSearchParams, setTypedSearchParams];
}

export { useTypedSearchParams, TypedNavigateOptions };
