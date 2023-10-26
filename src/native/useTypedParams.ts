import { BaseRoute, RouteOptions, OutPathnameParams } from "../common/index.js";
import { useParams } from "react-router-native";
import { useMemo } from "react";

export function useTypedParams<TOptions extends RouteOptions>(route: BaseRoute<TOptions>): OutPathnameParams<TOptions> {
  const params = useParams();
  return useMemo(() => route.$getTypedParams(params), [route, params]);
}
