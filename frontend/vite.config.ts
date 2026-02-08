import react from "@vitejs/plugin-react";
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
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/testSetup.ts",
  },
});
