import { BaseRoute, Types, OutHash } from "../common/index.js";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

export function useTypedHash<TPath extends string, TTypesMap extends Types>(
    route: BaseRoute<TPath, TTypesMap>
): OutHash<TTypesMap["hash"]> {
    const location = useLocation();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return useMemo(() => route.getTypedHash(location.hash), [route, location.hash]);
}
