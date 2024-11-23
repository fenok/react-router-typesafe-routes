import { resolve } from "path";
import { readdir, readFile, unlink, writeFile } from "fs/promises";

async function process(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });

  dirents.forEach((dirent) => {
    const res = resolve(dir, dirent.name);

    if (dirent.isDirectory()) {
      process(res);
    } else if (res.endsWith(".mts")) {
      unlink(res);
    }
  });
}

await process("./src");
