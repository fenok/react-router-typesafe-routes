import { Route, InSearchParams, OutSearchParams, InStateParams } from "../common/index.js";
import { useSearchParams, NavigateOptions, createSearchParams } from "react-router-dom";
import { useMemo, useCallback, MutableRefObject, useRef } from "react";

export interface TypedNavigateOptions<T> extends NavigateOptions {
    state?: T;
    preserveUntyped?: boolean;
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
    const untypedSearchParams = useMemo(() => route.getUntypedSearchParams(searchParams), [searchParams]);

    const typedSearchParamsRef = useUpdatingRef(typedSearchParams);

    const setTypedSearchParams = useCallback(
        (
            params:
                | InSearchParams<TSearchTypes>
                | ((prevParams: OutSearchParams<TSearchTypes>) => InSearchParams<TSearchTypes>),
            { state, preserveUntyped, ...restNavigateOptions }: TypedNavigateOptions<InStateParams<TStateTypes>> = {}
        ) => {
            const nextParams = createSearchParams(
                route.getPlainSearchParams(typeof params === "function" ? params(typedSearchParamsRef.current) : params)
            );

            if (preserveUntyped) appendSearchParams(nextParams, untypedSearchParams);

            setSearchParams(nextParams, {
                ...(state ? { state: route.buildState(state) } : {}),
                ...restNavigateOptions,
            });
        },
        [route, setSearchParams, typedSearchParamsRef]
    );

    return [typedSearchParams, setTypedSearchParams];
}

export function appendSearchParams(target: URLSearchParams, source: URLSearchParams) {
    for (const [key, val] of source.entries()) {
        target.append(key, val);
    }

    return target;
}

export function useUpdatingRef<T>(value: T): MutableRefObject<T> {
    const valueRef = useRef(value);
    valueRef.current = value;

    return valueRef;
}
