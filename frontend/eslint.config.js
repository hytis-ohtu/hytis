import js from "@eslint/js";
import configs from "eslint-plugin-jest-dom";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import testingLibrary from "eslint-plugin-testing-library";
import vitest from "eslint-plugin-vitest";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["node_modules", "dist", "build", ".next", "coverage"]),

  // All Files
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // Test Files
  {
    files: ["**/*.{test,spec}.{ts,tsx}"],
    extends: [
      testingLibrary.configs["flat/react"],
      configs.configs["flat/recommended"],
      vitest.configs.recommended,
    ],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
  },
]);
