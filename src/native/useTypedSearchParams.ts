import { BaseRoute, Types, InSearchParams, OutSearchParams, InState } from "../common/index.js";
import { useSearchParams, NavigateOptions } from "react-router-native";
import { useMemo, useCallback } from "react";

interface TypedNavigateOptions<T> extends NavigateOptions {
  state?: T;
  untypedSearchParams?: boolean;
}

function useTypedSearchParams<TTypesMap extends Types>(
  route: BaseRoute<string | undefined, TTypesMap>,
  typedDefaultInit?: InSearchParams<TTypesMap["searchParams"]>,
): [
  OutSearchParams<TTypesMap["searchParams"]>,
  (
    searchParams:
      | InSearchParams<TTypesMap["searchParams"]>
      | ((prevParams: OutSearchParams<TTypesMap["searchParams"]>) => InSearchParams<TTypesMap["searchParams"]>),
    navigateOptions?: TypedNavigateOptions<InState<TTypesMap["state"]>>,
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
      params:
        | InSearchParams<TTypesMap["searchParams"]>
        | ((prevParams: OutSearchParams<TTypesMap["searchParams"]>) => InSearchParams<TTypesMap["searchParams"]>),
      { state, untypedSearchParams, ...restNavigateOptions }: TypedNavigateOptions<InState<TTypesMap["state"]>> = {},
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
