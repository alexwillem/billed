// esbuild.config.js
import esbuild from "esbuild";

const isDev = process.argv.includes("--watch");

const config = {
  entryPoints: ["src/bill.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "dist/bill.js",
  sourcemap: isDev,
  minify: !isDev,
  external: [
    "chalk",
    "@inquirer/prompts",
    "ora",
    "pdfkit",
    "handlebars",
    "svg-to-pdfkit",
    "@xmldom/xmldom",
    "picocolors",
    "luxon",
  ],
  loader: {
    ".svg": "file",
    ".png": "file",
    ".jpg": "file",
    ".jpeg": "file",
    ".json": "json",
  },
  logLevel: "info",
};

if (isDev) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log("👀 Watching for changes...");
} else {
  await esbuild.build(config);
  console.log("✅ Build complete!");
}
