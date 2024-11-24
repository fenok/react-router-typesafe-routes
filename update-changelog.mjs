import { readFileSync, writeFileSync } from "fs";

const changelogPath = new URL("./CHANGELOG.md", import.meta.url);
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), { encoding: "utf8" }));

let changelog = readFileSync(changelogPath, { encoding: "utf8" });

changelog = changelog.replace("[Unreleased]", `[${pkg.version}] - ${new Date().toISOString().split("T")[0]}`);
changelog = changelog.replace(
  /\[unreleased]: .*/,
  `[${pkg.version}]: https://github.com/fenok/react-router-typesafe-routes/tree/v${pkg.version}`,
);

writeFileSync(changelogPath, changelog, { encoding: "utf8" });
