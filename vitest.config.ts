import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/**/*.{ts,tsx}"],
      // Only excludes what genuinely isn't executable application logic —
      // NOT src/pages or src/components. Those are real, unit-test-uncovered
      // surface; they're exercised by the separate Playwright E2E suite
      // instead, which this report doesn't (and can't) reflect. Scoping the
      // denominator down to make this percentage look better than it is
      // would be the same kind of misleading number this suite is supposed
      // to avoid — see README's Testing section for the honest split.
      exclude: [
        "src/test/**",
        "src/**/*.d.ts",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/components/ui/**",
      ],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
