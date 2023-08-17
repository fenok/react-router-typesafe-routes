import { RouteFragment, Types, OutState } from "../common/index.js";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

export function useTypedState<TTypesMap extends Types>(route: RouteFragment<TTypesMap>): OutState<TTypesMap["state"]> {
  const location = useLocation();
  return useMemo(() => route.$getTypedState(location.state), [route, location.state]);
}
