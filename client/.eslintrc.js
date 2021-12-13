module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true
    },
    extends: [
        "eslint:recommended",
        "plugin:jsx-a11y/recommended",
        "plugin:react/recommended"
    ],
    parser: "babel-eslint",
    parserOptions: {
        ecmaFeatures: {
            legacyDecorators: true,
            jsx: true
        },
        ecmaVersion: 2017,
        sourceType: "module"
    },
    plugins: [
        "jest",
        "jsx-a11y",
        "react",
        "react-hooks",
        "simple-import-sort"
    ],
    settings: {
        react: {
            version: "detect"
        }
    },
    root: true,
    rules: {
        "accessor-pairs": "error",
        "array-bracket-spacing": [
            "error",
            "never"
        ],
        "array-callback-return": "error",
        "arrow-body-style": [
            "error",
            "as-needed"
        ],
        "arrow-spacing": [
            "error",
            {
                after: true,
                before: true
            }
        ],
        "block-scoped-var": "error",
        "block-spacing": "error",
        "brace-style": "error",
        // "camelcase": "error",
        "comma-dangle": [
            "error",
            {
                arrays: "never",
                objects: "never",
                imports: "never",
                exports: "never",
                functions: "never"
            }
        ],
        "comma-spacing": [
            "error",
            {
                after: true,
                before: false
            }
        ],
        "comma-style": [
            "error",
            "last"
        ],
        complexity: "error",
        "computed-property-spacing": [
            "error",
            "never"
        ],
        curly: "error",
        "default-case": "error",
        "dot-location": [
            "error",
            "property"
        ],
        "dot-notation": "error",
        "eol-last": "error",
        eqeqeq: "error",
        "for-direction": "error",
        "func-call-spacing": "error",
        "func-name-matching": "error",
        "func-style": [
            "error",
            "declaration",
            {
                allowArrowFunctions: true
            }
        ],
        "generator-star-spacing": "error",
        "global-require": "error",
        "id-length": [
            "error",
            {
                min: 1,
                exceptions: ["i", "j", "n"]
            }
        ],
        indent: ["error", 4, { SwitchCase: 1 }],
        "jsx-quotes": "error",
        "key-spacing": "error",
        "keyword-spacing": "error",
        "line-comment-position": "error",
        "lines-around-comment": [
            "error",
            {
                allowBlockStart: true
            }
        ],
        "max-depth": "error",
        // "max-len": [
        //     "error",
        //     {
        //         code: 120,
        //         ignoreUrls: true,
        //         ignoreTemplateLiterals: true,
        //         // This pattern will ignore text in JSX elements and eslint comments
        //         ignorePattern: "\\s*<|[\\/*]\\s*eslint"
        //     }
        // ],
        "max-lines": [
            "error",
            {
                max: 416,
                skipComments: true
            }
        ],
        "max-nested-callbacks": "error",
        "max-params": [
            "error",
            {
                max: 5
            }
        ],
        "max-statements-per-line": "error",
        "multiline-ternary": "off",
        "new-cap": "error",
        "new-parens": "error",
        "no-alert": "error",
        "no-array-constructor": "error",
        // "no-await-in-loop": "error",
        "no-bitwise": "off",
        "no-caller": "error",
        "no-catch-shadow": "error",
        "no-continue": "error",
        "no-div-regex": "error",
        "no-duplicate-imports": "error",
        "no-else-return": "error",
        "no-empty-label": "off",
        "no-eq-null": "error",
        "no-eval": "error",
        "no-extend-native": "error",
        "no-extra-bind": "error",
        "no-extra-label": "error",
        "no-extra-parens": "off",
        "no-floating-decimal": "error",
        "no-implicit-coercion": "off",
        "no-implicit-globals": "error",
        "no-implied-eval": "error",
        "no-iterator": "error",
        "no-labels": "error",
        "no-lone-blocks": "error",
        "no-lonely-if": "error",
        "no-mixed-operators": "off",
        "no-multi-spaces": [
            "error",
            {
                ignoreEOLComments: true,
                exceptions: {
                    VariableDeclarator: true
                }
            }
        ],
        "no-multi-str": "error",
        "no-native-reassign": "error",
        "no-negated-condition": "error",
        "no-nested-ternary": "warn",
        "no-new": "error",
        "no-new-func": "error",
        "no-new-object": "error",
        "no-new-wrappers": "error",
        "no-octal-escape": "error",
        "no-param-reassign": "error",
        "no-proto": "error",
        "no-return-assign": "error",
        "no-script-url": "error",
        "no-self-compare": "error",
        "no-sequences": "error",
        "no-shadow": "error",
        "no-shadow-restricted-names": "error",
        "no-spaced-func": "error",
        "no-trailing-spaces": "error",
        "no-throw-literal": "error",
        "no-undef-init": "error",
        "no-unneeded-ternary": "error",
        "no-case-declarations": 0,
        "no-use-before-define": [
            "error",
            {
                functions: false
            }
        ],
        "no-useless-call": "error",
        "no-useless-concat": "error",
        "no-useless-constructor": "error",
        "no-void": "error",
        "no-with": "error",
        "operator-linebreak": "error",
        "quote-props": [
            "error",
            "as-needed"
        ],
        "prefer-const": "error",
        radix: "error",
        "react/prop-types": "off",
        // "react/jsx-no-bind": [
        //     "warn",
        //     {
        //         allowFunctions: true
        //     }
        // ],
        "react-hooks/rules-of-hooks": "off",
        "react-hooks/exhaustive-deps": "off",
        semi: "error",
        "simple-import-sort/imports": [
            "error",
            {
                groups: [
                    [
                        "^react"
                    ],
                    [
                        // Packages.
                        // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
                        "^@?\\w",
                        // Side effect imports.
                        "^\\u0000"
                    ],
                    [
                        // Relative imports.
                        // Anything that starts with a dot.
                        // ["^\\."],
                        "^Utils",
                        "^Config",
                        "^Common"
                    ]
                ]
            }
        ],
        "simple-import-sort/exports": "error",
        "space-infix-ops": "error",
        "space-before-blocks": "error",
        "space-before-function-paren": "off",
        "spaced-comment": "error",
        strict: [
            "error",
            "never"
        ],
        "vars-on-top": "error",
        "wrap-iife": [
            "error",
            "inside"
        ],
        "wrap-regex": "error",
        "jsx-a11y/no-autofocus": "warn"
    }
};
