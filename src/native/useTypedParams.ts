import { BaseRoute, OutParams, TypesMap } from "../common/index.js";
import { useParams } from "react-router-native";
import { useMemo } from "react";

export function useTypedParams<TPath extends string, TTypesMap extends TypesMap>(
    route: BaseRoute<TPath, TTypesMap>
): OutParams<TPath, TTypesMap["params"]> {
    const params = useParams();
    return useMemo(() => route.getTypedParams(params), [route, params]);
}
