import { createSearchParams, generatePath } from "react-router-dom";
import { routeCreator } from "../common";

const route = routeCreator({ createSearchParams, generatePath });

export { route };
