import { BaseRoute, OutState, Types } from "../common/index.js";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

export function useTypedState<TPath extends string, TTypesMap extends Types>(
    route: BaseRoute<TPath, TTypesMap>
): OutState<TTypesMap["state"]> {
    const location = useLocation();
    return useMemo(() => route.$getTypedState(location.state), [route, location.state]);
}
