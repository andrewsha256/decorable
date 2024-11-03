import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: [
            '**/*.{js,mjs,cjs,ts}',
        ],
    },
    {
        languageOptions: {
            globals: {...globals.browser, ...globals.node },
        },
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            'indent': [ 'error', 4 ],
            'quotes': [ 'error', 'single' ],
            'comma-dangle': [ 'error', 'always-multiline' ],
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
];
