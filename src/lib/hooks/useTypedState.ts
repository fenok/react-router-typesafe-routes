import { Route, RouteSpec, OutState } from "../route/index.js";
import { useLocation } from "react-router";
import { useMemo } from "react";

export function useTypedState<TSpec extends RouteSpec>(route: Route<TSpec>): OutState<TSpec> {
  const location = useLocation();
  return useMemo(() => route.$deserializeState(location.state), [route, location.state]);
}
