import * as esbuild from "esbuild";
import { copyFile, cp, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = dirname(fileURLToPath(import.meta.url));
const watch = process.argv.includes("--watch");

const dist = join(root, "dist");

async function copyStatics() {
  await mkdir(dist, { recursive: true });
  await copyFile(join(root, "public/index.html"), join(dist, "index.html"));
  await copyFile(join(root, "public/style.css"), join(dist, "style.css"));
  await cp(join(root, "public/assets"), join(dist, "assets"), { recursive: true, force: true }).catch(() => {});
}

/** One browser bundle: all TS/JS dependencies → dist/index.js */
const options = {
  absWorkingDir: root,
  entryPoints: ["src/index.ts"],
  bundle: true,
  outdir: "dist",
  entryNames: "[name]",
  platform: "browser",
  target: "es2022",
  format: "esm",
  sourcemap: true,
  plugins: [
    {
      name: "copy-static",
      setup(build) {
        build.onEnd(async (result) => {
          if (result.errors.length > 0) return;
          await copyStatics();
        });
      },
    },
  ],
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log("Watching src/ for changes…");
} else {
  await esbuild.build(options);
}
