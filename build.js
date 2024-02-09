import {writeFileSync as write, readFileSync} from 'fs'
import postcss from 'postcss'
import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'
import pseudo_is from 'postcss-pseudo-is'
import {minify} from 'terser'
import {apply_repls} from 'components/src/util.js'
import {execSync as exec} from 'child_process'
import pkg from './package.json' assert {type: 'json'}

const r = p => readFileSync(p, 'utf8')
const terser_conf = {module: true, mangle: {module: true}, compress: {module: true, unsafe: false, global_defs: {'window.__DEBUG__': false}}, format: {comments: false}}
const min_js = async (s, conf) => (await minify(s, {...terser_conf, ...conf}))
const cssnano_conf = {preset: ['default', {normalizeUrl: false, discardComments: {removeAll: true}}]}
const min_css = async s => (await postcss([pseudo_is, autoprefixer, cssnano(cssnano_conf)]).process(s, {from: undefined})).css

// Polyfills
const pf_url_base = 'https://polyfill.io/v3/polyfill.min.js?features='
const pf_features = [
    ['Object.fromEntries'],
    ['Array.prototype.flat'],
    ['Array.prototype.at'],
    ['String.prototype.at'],
    ['String.prototype.replaceAll'],
    ['globalThis', 'window.globalThis'],
    ['Intl.RelativeTimeFormat.~locale.ar', 'Intl.RelativeTimeFormat'],
]
const pf_url = pf_url_base + pf_features.map(pf => pf[0]).join(',')
const pf_script = `((${pf_features.map(pf => pf[1] || pf[0]).join(' && ')}) || document.write('<script src="${pf_url}"><\\/script>'))`

// Sentry
const sentry_js_url = `https://sentry.nuqayah.com/js-sdk-loader/${pkg.config.sentry_dsn}.min.js`
const sentry_js = apply_repls(await (await fetch(sentry_js_url)).text(), [
    ['bundle.min.js', 'bundle.tracing.replay.min.js'],
    [/new \w+.Replay/, '$&({maskAllInputs: false, maskAllText: false})'],
    [/{(?="dsn":)/, `{"release": "${pkg.version}",`],
    [/("tracesSampleRate"):1/, '$1:0'],
])

// Service worker
write('dist/sw.js', (await min_js(apply_repls(r('src/util/sw.js'), [
    ['$TS$', Date.now()],
    ['$POLYFILLS$', pf_url],
    ['$SENTRY$', sentry_js.match(/https:\/\/browser.sentry-cdn.com.*?\.js/)[0]],
]))).code)

// Minify
const [css, {code, map}] = await Promise.all([
    min_css(r('dist/style.css')),
    min_js({'bundle.es.js': r('dist/bundle.es.js')}, {sourceMap: {content: r('dist/bundle.es.js.map')}})
])

// Write bundle and sourcemap
write('dist/bundle-final.js', code + '\n//# sourceMappingURL=bundle-final.js.map')
write('dist/bundle-final.js.map', map)

// Upload to sentry
exec(`sentry-cli sourcemaps inject -o sentry -p ${pkg.name} -r ${pkg.version} ./dist/bundle-final.js*`, {stdio: 'inherit'})
exec(`sentry-cli sourcemaps upload -o sentry -p ${pkg.name} -r ${pkg.version} ./dist/bundle-final.js*`, {stdio: 'inherit'})

// Combine
const pg = apply_repls(r('index.html'), [
    [/>\n+ */g, '>'],
    [/(?<=<\/title>)/, () => `<style>${css}</style>`],
    [/<script src.+<\/script>/, () => `<script>${sentry_js};${pf_script}</script><script type=module>${r('dist/bundle-final.js')}</script>`],
])
const icon_repls = [[/ xmlns=".*?"/, ''], ['id="', 'id="icon-'], [/\n */g, ''], [/(\d")\//g, '$1 /'], [/="([^, ]+)"/g, '=$1']]
write('dist/index.html', pg + apply_repls(r('public/icons.svg'), icon_repls))
