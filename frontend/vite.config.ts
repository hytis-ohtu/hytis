import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  preview: {
    allowedHosts: [
      "hytis-ohtuprojekti-staging.ext.ocp-test-0.k8s.it.helsinki.fi",
    ],
  },

  resolve: {
    alias: {
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@types": path.resolve(__dirname, "./src/types.ts"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@contexts": path.resolve(__dirname, "./src/contexts"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/testSetup.ts",
    clearMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage",
    },
  },
});
