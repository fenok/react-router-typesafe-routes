import { BaseRoute, RouteOptions, OutHash } from "../common/index.js";
import { useLocation } from "react-router-native";
import { useMemo } from "react";

export function useTypedHash<TOptions extends RouteOptions>(route: BaseRoute<TOptions>): OutHash<TOptions> {
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return useMemo(() => route.$getTypedHash(location.hash), [route, location.hash]);
}
