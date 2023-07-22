import { BaseRoute, OutPathnameParams, Types } from "../common/index.js";
import { useParams } from "react-router-dom";
import { useMemo } from "react";

export function useTypedParams<TPath extends string, TTypesMap extends Types>(
    route: BaseRoute<TPath, TTypesMap>
): OutPathnameParams<TTypesMap["params"]> {
    const params = useParams();
    return useMemo(() => route.$getTypedParams(params), [route, params]);
}
