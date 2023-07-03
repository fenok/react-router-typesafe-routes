import { BaseRoute, Types } from "../common/index.js";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

export function useTypedHash<TPath extends string, TTypesMap extends Types>(
    route: BaseRoute<TPath, TTypesMap>
): TTypesMap["hash"][number] | undefined {
    const location = useLocation();
    return useMemo(() => route.getTypedHash(location.hash), [route, location.hash]);
}
