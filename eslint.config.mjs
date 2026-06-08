import { defineConfig, globalIgnores } from "eslint/config";
import importPlugin from "eslint-plugin-import";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      ...importPlugin.flatConfigs.recommended.rules,
      ...jsxA11yPlugin.flatConfigs.recommended.rules,
      "arrow-body-style": "warn",
      "default-case": "warn",
      "dot-notation": "warn",
      "import/no-extraneous-dependencies": [
        "warn",
        {
          devDependencies: [
            "**/*.config.{js,mjs,ts}",
            "eslint.config.mjs",
            "next.config.ts",
            "postcss.config.mjs",
          ],
        },
      ],
      "import/no-duplicates": "warn",
      "import/no-unused-modules": "off",
      "import/order": "warn",
      "import/prefer-default-export": "off",
      "import/extensions": "off",
      "import/max-dependencies": "off",
      "import/no-internal-modules": "off",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/control-has-associated-label": "warn",
      "jsx-a11y/label-has-associated-control": "warn",
      "jsx-a11y/label-has-for": "off",
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "no-alert": "warn",
      "no-bitwise": "warn",
      "no-continue": "warn",
      "no-else-return": "warn",
      "no-plusplus": "warn",
      "no-promise-executor-return": "warn",
      "no-restricted-globals": ["warn", "confirm"],
      "no-restricted-properties": [
        "warn",
        {
          object: "Math",
          property: "pow",
          message: "Use the exponentiation operator (**) instead.",
        },
      ],
      "prefer-exponentiation-operator": "warn",
      "prefer-template": "warn",
      radix: "warn",
      "react/button-has-type": "warn",
      "react/jsx-boolean-value": "warn",
      "react/jsx-handler-names": "warn",
      "react/jsx-no-useless-fragment": "warn",
      "react/no-array-index-key": "warn",
      "react/no-danger": "warn",
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
      "react/boolean-prop-naming": "off",
      "react/function-component-definition": "off",
      "react/jsx-no-literals": "off",
      "react/jsx-filename-extension": ["warn", { extensions: [".jsx", ".tsx"] }],
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
  prettier,
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
