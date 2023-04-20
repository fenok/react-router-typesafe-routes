import { Route } from "../common/index.js";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

export function useTypedHash<TPath extends string, TPathTypes, TSearchTypes, THash extends string[], TStateTypes>(
    route: Route<TPath, TPathTypes, TSearchTypes, THash, TStateTypes>
): THash[number] | undefined {
    const location = useLocation();
    return useMemo(() => route.getTypedHash(location.hash), [route, location.hash]);
}
