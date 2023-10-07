import { BaseRoute, RouteOptions, OutPathnameParams } from "../common/index.js";
import { useParams } from "react-router-dom";
import { useMemo } from "react";

export function useTypedParams<TTypesMap extends RouteOptions>(
  route: BaseRoute<TTypesMap>,
): OutPathnameParams<TTypesMap["params"]> {
  const params = useParams();
  return useMemo(() => route.$getTypedParams(params), [route, params]);
}
