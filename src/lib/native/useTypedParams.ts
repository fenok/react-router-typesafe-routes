import { Route, OutParams } from "../common/index.js";
import { useParams } from "react-router-native";
import { useMemo } from "react";

export function useTypedParams<TPath extends string, TPathTypes, TSearchTypes, THash extends string[], TStateParams>(
    route: Route<TPath, TPathTypes, TSearchTypes, THash, TStateParams>
): OutParams<TPath, TPathTypes> {
    const params = useParams();
    return useMemo(() => route.getTypedParams(params), [route, params]);
}
