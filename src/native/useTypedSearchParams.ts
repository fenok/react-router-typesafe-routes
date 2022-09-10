import { Route, InSearchParams, OutSearchParams, InStateParams } from "../common/index.js";
import { useSearchParams, NavigateOptions, createSearchParams } from "react-router-native";
import { useMemo, useCallback, MutableRefObject, useRef } from "react";

interface TypedNavigateOptions<T> extends NavigateOptions {
    state?: T;
    preserveUntyped?: boolean;
}

function useTypedSearchParams<TPath extends string, TPathTypes, TSearchTypes, THash extends string[], TStateTypes>(
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

    const typedSearchParams = useMemo(() => route.getTypedSearchParams(searchParams), [route, searchParams]);
    const untypedSearchParams = useMemo(() => route.getUntypedSearchParams(searchParams), [route, searchParams]);

    const typedSearchParamsRef = useUpdatingRef(typedSearchParams);
    const untypedSearchParamsRef = useUpdatingRef(untypedSearchParams);

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

            if (preserveUntyped) appendSearchParams(nextParams, untypedSearchParamsRef.current);

            setSearchParams(nextParams, {
                ...(state ? { state: route.buildState(state) } : {}),
                ...restNavigateOptions,
            });
        },
        [route, setSearchParams, typedSearchParamsRef, untypedSearchParamsRef]
    );

    return [typedSearchParams, setTypedSearchParams];
}

function appendSearchParams(target: URLSearchParams, source: URLSearchParams) {
    for (const [key, val] of source.entries()) {
        target.append(key, val);
    }

    return target;
}

function useUpdatingRef<T>(value: T): MutableRefObject<T> {
    const valueRef = useRef(value);
    valueRef.current = value;

    return valueRef;
}

export { useTypedSearchParams, TypedNavigateOptions };
