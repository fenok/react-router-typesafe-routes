import { Route, InSearchParams, OutSearchParams, InStateParams } from "../common";
import { useSearchParams } from "react-router-native";
import { useMemo, useCallback } from "react";
import { NavigateOptions } from "react-router";

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
        searchParams: InSearchParams<TSearchTypes>,
        navigateOptions?: TypedNavigateOptions<InStateParams<TStateTypes>>
    ) => void
] {
    const defaultInit = useMemo(
        () => (typedDefaultInit ? route.getPlainSearchParams(typedDefaultInit) : undefined),
        [route, typedDefaultInit]
    );

    const [searchParams, setSearchParams] = useSearchParams(defaultInit);

    const typedSearchParams = useMemo(() => route.getTypedSearchParams(searchParams), [searchParams]);

    const setTypedSearchParams = useCallback(
        (params: InSearchParams<TSearchTypes>, navigateOptions?: TypedNavigateOptions<InStateParams<TStateTypes>>) => {
            setSearchParams(route.getPlainSearchParams(params), {
                ...navigateOptions,
                ...(navigateOptions?.state ? { state: route.buildState(navigateOptions?.state) } : {}),
            });
        },
        [route, setSearchParams]
    );

    return [typedSearchParams, setTypedSearchParams];
}
