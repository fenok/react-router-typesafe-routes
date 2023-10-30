import { BaseRoute, RouteOptions, OutState } from "../common/index.js";
import { useLocation } from "react-router-native";
import { useMemo } from "react";

export function useTypedState<TOptions extends RouteOptions>(route: BaseRoute<TOptions>): OutState<TOptions> {
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return useMemo(() => route.$getTypedState(location.state), [route, location.state]);
}
