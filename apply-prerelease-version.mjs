import { exec } from "child_process";
import pkg from "./package.json" assert { type: "json" };

const SUFFIX = "dev.";

exec(`yarn version apply --prerelease=${SUFFIX}${Number(pkg.version.split(SUFFIX)[1] ?? -1) + 1}`);
