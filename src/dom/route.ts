import { createSearchParams, generatePath } from "react-router-dom";
import { routeCreator } from "../common/index.js";

const route = routeCreator({ createSearchParams, generatePath });

export { route };
