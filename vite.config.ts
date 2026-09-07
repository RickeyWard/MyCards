import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL("./package.json", import.meta.url)), "utf8"),
);

// Single-file ES bundle: Home Assistant loads one JS resource per repository.
export default defineConfig(({ mode }) => {
  const dev = mode === "development";
  return {
    define: {
      __VERSION__: JSON.stringify(pkg.version),
    },
    build: {
      target: "es2021",
      outDir: "dist",
      emptyOutDir: true,
      minify: !dev,
      sourcemap: dev,
      cssCodeSplit: false,
      lib: {
        entry: "src/main.ts",
        formats: ["es"],
        fileName: () => "mycards.js",
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
  };
});
