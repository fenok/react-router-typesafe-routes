import { Route, RouteSpec, OutPathnameParams } from "../common/index.js";
import { useParams } from "react-router-native";
import { useMemo } from "react";

export function useTypedParams<TSpec extends RouteSpec>(route: Route<TSpec>): OutPathnameParams<TSpec> {
  const params = useParams();
  return useMemo(() => route.$getTypedParams(params), [route, params]);
}
