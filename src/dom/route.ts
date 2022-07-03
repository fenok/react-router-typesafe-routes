import { createSearchParams } from "react-router-dom";
import { route } from "../common";

const domRoute = route({ createSearchParams });

export { domRoute as route };
