import { BaseRoute, Types, OutPathnameParams } from "../common/index.js";
import { useParams } from "react-router-native";
import { useMemo } from "react";

export function useTypedParams<TTypesMap extends Types>(
  route: BaseRoute<string | undefined, TTypesMap>,
): OutPathnameParams<TTypesMap["params"]> {
  const params = useParams();
  return useMemo(() => route.$getTypedParams(params), [route, params]);
}
