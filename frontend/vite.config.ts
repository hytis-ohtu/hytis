import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  preview: {
    allowedHosts: ["ohtuprojekti-staging.ext.ocp-test-0.k8s.it.helsinki.fi"],
  },
})
