import js from '@eslint/js'
import globals from 'globals'
import sveltePlugin from 'eslint-plugin-svelte'
import svelteParser from 'svelte-eslint-parser'

const prep_globals = s => Object.fromEntries(s.split(' ').map(g => [g, 'readonly']))
const globals_all = {
    ...prep_globals('onMount beforeUpdate afterUpdate onDestroy tick setContext getContext dispatch createEventDispatcher writable readable derived get tweened spring fade blur fly slide scale draw flip'),
    ...prep_globals('Sentry'),
}

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
    js.configs.recommended,
    {
        ignores: [
            '**/misc/**/*',
            '**/.svelte-kit/**/*',
            '**/node_modules/**',
            '**/dist/**',
        ],
    },
    {
        files: ['**/*.js'],
        ignores: ['src/util/sw.js'],
        languageOptions: {
            globals: {...globals.es2021, ...globals.browser},
        },
    },
    {
        files: ['src/util/sw.js'],
        languageOptions: {
            globals: {...globals.es2021, ...globals.serviceworker},
        },
    },
    {
        files: ['vite.config.js', 'build.js', 'deploy.js'],
        languageOptions: {
            globals: {...globals.es2021, ...globals.node, ...prep_globals('chalk fs $ argv')},
        },
    },
    {
        files: ['**/*.svelte'],
        languageOptions: {
            parser: svelteParser,
            globals: {...globals.es2021, ...globals.browser, ...globals_all},
        },
        plugins: {
            svelte: sveltePlugin,
        },
        rules: {
            ...sveltePlugin.configs.recommended.rules,
            'no-inner-declarations': 'off',
            'no-self-assign': 'off',
            'svelte/no-at-html-tags': 'off',
            'svelte/valid-compile': ['error', {ignoreWarnings: true}],
            'no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
        },
    },
]

export default config
