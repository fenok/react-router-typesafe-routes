import { BaseRoute, RouteOptions, OutHash } from "../common/index.js";
import { useLocation } from "react-router-native";
import { useMemo } from "react";

export function useTypedHash<TTypesMap extends RouteOptions>(route: BaseRoute<TTypesMap>): OutHash<TTypesMap["hash"]> {
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return useMemo(() => route.$getTypedHash(location.hash), [route, location.hash]);
}
