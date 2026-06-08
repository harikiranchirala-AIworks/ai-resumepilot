import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    optimizeDeps: {
      // latex.js dynamically `require()`s package/documentclass files and ships
      // .keep marker files that esbuild's dep optimizer can't load.
      exclude: ["latex.js", "html2pdf.js"],
    },
    ssr: {
      // Both are browser-only — never bundle into SSR.
      noExternal: [],
      external: ["latex.js", "html2pdf.js"],
    },
  },
});
