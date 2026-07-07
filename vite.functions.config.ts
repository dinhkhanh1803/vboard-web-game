import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@contracts": fileURLToPath(new URL("./contracts", import.meta.url)),
      "@engine": fileURLToPath(new URL("./game-engine/src", import.meta.url)),
      "@functions": fileURLToPath(new URL("./functions/src", import.meta.url)),
    },
  },
  build: {
    emptyOutDir: true,
    lib: {
      entry: fileURLToPath(new URL("./functions/src/index.ts", import.meta.url)),
      fileName: "index",
      formats: ["es"],
    },
    minify: false,
    outDir: "functions/lib",
    rollupOptions: {
      external: ["firebase-admin/app", "firebase-admin/firestore", "firebase-functions/v2/https"],
    },
    sourcemap: true,
    target: "node22",
  },
});
