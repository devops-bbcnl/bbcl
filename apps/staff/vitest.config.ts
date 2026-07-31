import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Node environment by default (API routes, services) — jsdom is opted into per
// test file via a `// @vitest-environment jsdom` docblock for client components.
// See eng review "Test framework for apps/staff" decision.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./") },
  },
});
