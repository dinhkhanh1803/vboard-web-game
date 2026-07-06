import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@engine": fileURLToPath(new URL("./game-engine/src", import.meta.url)),
      "@functions": fileURLToPath(new URL("./functions/src", import.meta.url)),
    },
  },
  test: {
    pool: "threads",
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
