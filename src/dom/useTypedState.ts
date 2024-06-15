import { Route, RouteSpec, OutState } from "../common/index.js";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

export function useTypedState<TSpec extends RouteSpec>(route: Route<TSpec>): OutState<TSpec> {
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return useMemo(() => route.$getTypedState(location.state), [route, location.state]);
}
