import { BaseRoute, RouteOptions, OutState } from "../common/index.js";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

export function useTypedState<TOptions extends RouteOptions>(route: BaseRoute<TOptions>): OutState<TOptions> {
  const location = useLocation();
  return useMemo(() => route.$getTypedState(location.state), [route, location.state]);
}
