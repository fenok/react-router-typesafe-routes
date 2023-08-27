import { BaseRoute, Types, OutState } from "../common/index.js";
import { useLocation } from "react-router-native";
import { useMemo } from "react";

export function useTypedState<TTypesMap extends Types>(
  route: BaseRoute<string | undefined, TTypesMap>,
): OutState<TTypesMap["state"]> {
  const location = useLocation();
  return useMemo(() => route.$getTypedState(location.state), [route, location.state]);
}
