// Lists every image under public/images so components know which real photos exist.
// Runs before dev and build. Drop a file in the right folder (see IMAGE_SPEC.md) and it appears.
import { readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = "public/images";
const exts = /\.(webp|avif|png|jpe?g)$/i;
const files = [];

function walk(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (exts.test(name)) files.push("/" + relative("public", full).split(sep).join("/"));
  }
}
walk(root);
files.sort();

mkdirSync("src/generated", { recursive: true });
writeFileSync("src/generated/image-manifest.json", JSON.stringify(files, null, 2) + "\n");
console.log(`image manifest: ${files.length} image(s)`);
