import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "module",
            globals: {
                process: "readonly",
                __dirname: "readonly",
                module: "readonly",
                require: "readonly",
                describe: "readonly",
                test: "readonly",
                expect: "readonly",
                jest: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly",
                it: "readonly",
                global: "readonly",
                console: "readonly",
                Buffer: "readonly",
            },
        },
        plugins: {
            prettier: eslintPluginPrettier,
        },
        rules: {
            "prettier/prettier": ["error"],
            "no-unused-vars": ["warn"],
            "no-console": "off",
            eqeqeq: ["error", "always"],
            semi: ["error", "always"],
        },
    },
    prettier,
];
