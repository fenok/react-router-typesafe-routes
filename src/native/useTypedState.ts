import { BaseRoute, OutStateParams, TypesMap } from "../common/index.js";
import { useLocation } from "react-router-native";
import { useMemo } from "react";

export function useTypedState<TPath extends string, TTypesMap extends TypesMap>(
    route: BaseRoute<TPath, TTypesMap>
): OutStateParams<TTypesMap["state"]> {
    const location = useLocation();
    return useMemo(() => route.getTypedState(location.state), [route, location.state]);
}
