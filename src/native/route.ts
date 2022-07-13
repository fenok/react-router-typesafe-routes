import { createSearchParams, generatePath } from "react-router-native";
import { routeCreator } from "../common";

const route = routeCreator({ createSearchParams, generatePath });

export { route };
