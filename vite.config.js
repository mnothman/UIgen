import {svelte} from '@sveltejs/vite-plugin-svelte'
import autoimport from 'svelte-preprocess-autoimport'
import svelte_preprocess from 'svelte-preprocess'
import path from 'path'
import {apply_repls} from 'components/src/util.js'
import {execFileSync as exec} from 'child_process'
import pkg from './package.json'

const is_build = process.argv.includes('build')
const markup_repls = [
    [/<icon id=(.+?)>/g, `<svg class="icon icon-$1"><use href=${is_build ? '#icon-' : '/icons.svg#'}$1/></svg>`],
    [/(?<=<a )(?=href="?https?:)/g, 'target=_blank '],
]

const vars = {
    'window.__BUILD_DATE__': `'${(new Date).toISOString()}'`,
    'window.__BUILD_HASH__': `'${exec('git', ['rev-parse', '--short', 'HEAD']).toString().trim()}'`,
    'window.__APP_VERSION__': `'${pkg.version}'`,
    'window.__DEBUG__': !is_build,
}

/** @type {import('vite').UserConfig}*/
export default {
    publicDir: is_build ? false : 'public',
    build: {
        reportCompressedSize: false,
        minify: false,
        sourcemap: true,
        lib: {
            entry: 'src/main.js',
            formats: ['es'],
            fileName: (format) => `bundle.${format}.js`,
        },
        rollupOptions: {
            output: {
                intro: Object.entries(vars).map(([k, v]) => `${k} = ${v}`).join('\n'),
            },
        },
    },
    server: {host: !!process.env.VITE_HOST},
    resolve: {
        alias: [{find: '~', replacement: path.resolve('src')}],
    },
    define: is_build ? {} : vars,
    plugins: [
        svelte({
            preprocess: [
                {markup({content}) { return {code: apply_repls(content, markup_repls)} }},
                autoimport(),
                svelte_preprocess({markupTagName: 'not_a_tag'}),
            ],
            onwarn(warning, handler) {
                const IGNORED_WARNINGS = [
                    'a11y-autofocus',
                    'a11y-click-events-have-key-events',
                    'a11y-label-has-associated-control',
                    'a11y-no-noninteractive-element-interactions',
                ]
                if (!IGNORED_WARNINGS.includes(warning.code))
                    handler(warning)
            },
        }),
    ],
    optimizeDeps: {
        exclude: ['tinro'],
    },
}
