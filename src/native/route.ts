import { createSearchParams } from "react-router-native";
import { route } from "../common";

const nativeRoute = route({ createSearchParams });

export { nativeRoute as route };
