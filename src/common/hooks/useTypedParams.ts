import { Route, OutParams } from "../route";
import { useParams } from "react-router";
import { useMemo } from "react";

export function useTypedParams<TPath extends string, TPathTypes, TSearchTypes, THash extends string[], TStateParams>(
    route: Route<TPath, TPathTypes, TSearchTypes, THash, TStateParams>
): OutParams<TPath, TPathTypes> {
    const params = useParams();
    return useMemo(() => route.getTypedParams(params), [route, params]);
}
