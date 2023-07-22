import { BaseRoute, InSearchParams, OutSearchParams, InState, Types } from "../common/index.js";
import { useSearchParams, NavigateOptions, createSearchParams } from "react-router-native";
import { useMemo, useCallback } from "react";

interface TypedNavigateOptions<T> extends NavigateOptions {
    state?: T;
    preserveUntyped?: boolean;
}

function useTypedSearchParams<TPath extends string, TTypesMap extends Types>(
    route: BaseRoute<TPath, TTypesMap>,
    typedDefaultInit?: InSearchParams<TTypesMap["searchParams"]>
): [
    OutSearchParams<TTypesMap["searchParams"]>,
    (
        searchParams:
            | InSearchParams<TTypesMap["searchParams"]>
            | ((prevParams: OutSearchParams<TTypesMap["searchParams"]>) => InSearchParams<TTypesMap["searchParams"]>),
        navigateOptions?: TypedNavigateOptions<InState<TTypesMap["state"]>>
    ) => void
] {
    const defaultInit = useMemo(
        () => (typedDefaultInit ? route.$getPlainSearchParams(typedDefaultInit) : undefined),
        [route, typedDefaultInit]
    );

    const [searchParams, setSearchParams] = useSearchParams(defaultInit);

    const typedSearchParams = useMemo(() => route.$getTypedSearchParams(searchParams), [route, searchParams]);

    const setTypedSearchParams = useCallback(
        (
            params:
                | InSearchParams<TTypesMap["searchParams"]>
                | ((
                      prevParams: OutSearchParams<TTypesMap["searchParams"]>
                  ) => InSearchParams<TTypesMap["searchParams"]>),
            { state, preserveUntyped, ...restNavigateOptions }: TypedNavigateOptions<InState<TTypesMap["state"]>> = {}
        ) => {
            setSearchParams(
                (prevParams) => {
                    const nextParams = createSearchParams(
                        route.$getPlainSearchParams(
                            typeof params === "function" ? params(route.$getTypedSearchParams(prevParams)) : params
                        )
                    );

                    if (preserveUntyped) appendSearchParams(nextParams, route.$getUntypedSearchParams(prevParams));

                    return nextParams;
                },
                {
                    ...(state ? { state: route.$buildState(state) } : {}),
                    ...restNavigateOptions,
                }
            );
        },
        [route, setSearchParams]
    );

    return [typedSearchParams, setTypedSearchParams];
}

function appendSearchParams(target: URLSearchParams, source: URLSearchParams) {
    for (const [key, val] of source.entries()) {
        target.append(key, val);
    }

    return target;
}

export { useTypedSearchParams, TypedNavigateOptions };
