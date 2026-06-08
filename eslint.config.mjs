import { FlatCompat } from "@eslint/eslintrc";
import { fixupConfigRules } from "@eslint/compat";
import { defineConfig, globalIgnores } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});
const warnOnly = (rules = {}) =>
  Object.fromEntries(
    Object.entries(rules).map(([rule, value]) => {
      if (Array.isArray(value)) {
        return [rule, ["warn", ...value.slice(1)]];
      }
      if (value === "off" || value === 0) {
        return [rule, value];
      }
      return [rule, "warn"];
    })
  );

const airbnbConfigs = fixupConfigRules(compat.extends("airbnb", "airbnb/hooks")).map((config) => {
  const airbnbConfig = { ...config };
  delete airbnbConfig.plugins;
  airbnbConfig.rules = warnOnly(airbnbConfig.rules);
  return airbnbConfig;
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...airbnbConfigs,
  prettier,
  {
    rules: {
      "import/extensions": "off",
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: [
            "**/*.config.{js,mjs,ts}",
            "eslint.config.mjs",
            "next.config.ts",
            "postcss.config.mjs",
          ],
        },
      ],
      "import/no-unused-modules": "off",
      "import/prefer-default-export": "off",
      "import/no-internal-modules": "off",
      "import/max-dependencies": "off",
      "line-comment-position": "off",
      "lines-around-directive": "off",
      complexity: "off",
      camelcase: "off",
      "consistent-return": "off",
      "func-style": "off",
      "max-lines-per-function": "off",
      "max-lines": "off",
      "max-statements": "off",
      "multiline-comment-style": "off",
      "no-magic-numbers": "off",
      "no-nested-ternary": "off",
      "no-restricted-syntax": "off",
      "no-shadow": "off",
      "no-underscore-dangle": "off",
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-use-before-define": "off",
      "jsx-a11y/label-has-for": "off",
      "react/boolean-prop-naming": "off",
      "react/function-component-definition": "off",
      "react/jsx-no-literals": "off",
      "react/jsx-filename-extension": ["error", { extensions: [".jsx", ".tsx"] }],
      "react/jsx-props-no-spreading": "off",
      "react/jsx-sort-default-props": "off",
      "react/jsx-sort-props": "off",
      "react/react-in-jsx-scope": "off",
      "react/require-default-props": "off",
      "sort-imports": "off",
      "sort-keys": "off",
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
      react: {
        version: "detect",
      },
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/videos/**",
  ]),
]);

export default eslintConfig;
