import { Route, OutStateParams } from "../common/index.js";
import { useLocation } from "react-router-native";
import { useMemo } from "react";

export function useTypedState<TPath extends string, TPathTypes, TSearchTypes, THash extends string[], TStateParams>(
    route: Route<TPath, TPathTypes, TSearchTypes, THash, TStateParams>
): OutStateParams<TStateParams> {
    const location = useLocation();
    return useMemo(() => route.getTypedState(location.state), [route, location.state]);
}
