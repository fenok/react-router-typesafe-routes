import { Route, InSearchParams, OutSearchParams, InStateParams } from "../common/index.js";
import { useSearchParams, NavigateOptions } from "react-router-dom";
import { useMemo, useCallback, MutableRefObject, useRef } from "react";

export interface TypedNavigateOptions<T> extends NavigateOptions {
    state?: T;
}

export function useTypedSearchParams<
    TPath extends string,
    TPathTypes,
    TSearchTypes,
    THash extends string[],
    TStateTypes
>(
    route: Route<TPath, TPathTypes, TSearchTypes, THash, TStateTypes>,
    typedDefaultInit?: InSearchParams<TSearchTypes>
): [
    OutSearchParams<TSearchTypes>,
    (
        searchParams:
            | InSearchParams<TSearchTypes>
            | ((prevParams: OutSearchParams<TSearchTypes>) => InSearchParams<TSearchTypes>),
        navigateOptions?: TypedNavigateOptions<InStateParams<TStateTypes>>
    ) => void
] {
    const defaultInit = useMemo(
        () => (typedDefaultInit ? route.getPlainSearchParams(typedDefaultInit) : undefined),
        [route, typedDefaultInit]
    );

    const [searchParams, setSearchParams] = useSearchParams(defaultInit);

    const typedSearchParams = useMemo(() => route.getTypedSearchParams(searchParams), [searchParams]);

    const typedSearchParamsRef = useUpdatingRef(typedSearchParams);

    const setTypedSearchParams = useCallback(
        (
            params:
                | InSearchParams<TSearchTypes>
                | ((prevParams: OutSearchParams<TSearchTypes>) => InSearchParams<TSearchTypes>),
            navigateOptions?: TypedNavigateOptions<InStateParams<TStateTypes>>
        ) => {
            setSearchParams(
                route.getPlainSearchParams(
                    typeof params === "function" ? params(typedSearchParamsRef.current) : params
                ),
                {
                    ...navigateOptions,
                    ...(navigateOptions?.state ? { state: route.buildState(navigateOptions?.state) } : {}),
                }
            );
        },
        [route, setSearchParams, typedSearchParamsRef]
    );

    return [typedSearchParams, setTypedSearchParams];
}

export function useUpdatingRef<T>(value: T): MutableRefObject<T> {
    const valueRef = useRef(value);
    valueRef.current = value;

    return valueRef;
}
