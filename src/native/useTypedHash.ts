import { Route, RouteSpec, OutHash } from "../common/index.js";
import { useLocation } from "react-router-native";
import { useMemo } from "react";

export function useTypedHash<TSpec extends RouteSpec>(route: Route<TSpec>): OutHash<TSpec> {
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return useMemo(() => route.$deserializeHash(location.hash), [route, location.hash]);
}
