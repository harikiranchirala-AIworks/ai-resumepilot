import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    optimizeDeps: {
      // latex.js dynamically require()s package/documentclass files and ships
      // .keep marker files that esbuild's dep optimizer can't load. html2pdf.js
      // is browser-only too. Both are imported dynamically inside effects.
      exclude: ["latex.js", "html2pdf.js"],
    },
  },
});
