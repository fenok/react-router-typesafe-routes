import { Route, RouteSpec, OutPathnameParams } from "../route/index.js";
import { useParams } from "react-router";
import { useMemo } from "react";

export function useTypedParams<TSpec extends RouteSpec>(route: Route<TSpec>): OutPathnameParams<TSpec> {
  const params = useParams();
  return useMemo(() => route.$deserializeParams(params), [route, params]);
}
