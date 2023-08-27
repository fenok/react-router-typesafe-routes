import { createSearchParams, generatePath } from "react-router-dom";
import { createRoute } from "../common/index.js";

const route = createRoute({ createSearchParams, generatePath });

export { route };
