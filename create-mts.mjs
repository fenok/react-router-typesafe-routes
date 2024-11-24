import { resolve } from "path";
import { readdir, readFile, writeFile } from "fs/promises";

async function process(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });

  dirents.forEach((dirent) => {
    const res = resolve(dir, dirent.name);

    if (dirent.isDirectory()) {
      process(res);
    } else if (res.endsWith(".ts")) {
      createMts(res);
    }
  });
}

async function createMts(filePath) {
  const content = await readFile(filePath, { encoding: "utf8" });
  const ctsContent = content.replaceAll('.js"', '.mjs"');
  const ctsFilePath = filePath.replace(".ts", ".mts");

  await writeFile(ctsFilePath, ctsContent, { encoding: "utf8" });
}

await process("./src");
