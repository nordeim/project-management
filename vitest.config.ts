import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit-test layer for the pure domain seams (router, clarify questions,
// plan sanitizer, check-in mapping). Component/E2E coverage stays in
// scripts/smoke-test.sh — this config intentionally covers lib/ only.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
