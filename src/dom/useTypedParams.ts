import { BaseRoute, RouteOptions, OutPathnameParams } from "../common/index.js";
import { useParams } from "react-router-dom";
import { useMemo } from "react";

export function useTypedParams<TOptions extends RouteOptions>(
  route: BaseRoute<TOptions>,
): OutPathnameParams<TOptions["params"]> {
  const params = useParams();
  return useMemo(() => route.$getTypedParams(params), [route, params]);
}
