import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    optimizeDeps: {
      // html2pdf.js is browser-only and is imported dynamically inside effects.
      exclude: ["html2pdf.js"],
    },
  },
});
