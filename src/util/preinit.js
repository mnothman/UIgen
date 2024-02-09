import {get_vh_offset} from 'components/src/util.js'
window.BASE_TITLE = document.title

if (window.__DEBUG__)
    window.Sentry = {captureMessage: console.log}

// Check localStorage + indexedDB
try {
    localStorage.setItem('_TEST_KEY_', 1)
    localStorage.removeItem('_TEST_KEY_')
} catch (e) {
    delete window['localStorage']
    window.localStorage = {setItem: () => {}, getItem: () => {}, removeItem: () => {}}
}
indexedDB.open('_TEST_DB_', 1).onerror = () => {
    alert('لم نتمكن من فتح قاعدة البيانات! عذرا، لن يعمل التطبيق.')
    Sentry.captureMessage('Failed to open DB')
}

if (!location.host.includes(''))
    alert('ERROR')

function remove_search_param(url_str, param) {
    const url_object = new URL(url_str)
    url_object.searchParams.delete(param)
    return url_object.toString()
}
if (location.search.includes('fbclid='))
    location.replace(remove_search_param(location.href, 'fbclid'))

// ServiceWorker
if (!window.__DEBUG__ && navigator.serviceWorker) {
    if (!navigator.serviceWorker.controller)
        navigator.serviceWorker.register('/sw.js')
    else {
        let refreshing
        // Reload page if a new service worker took over
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                location.reload()
                refreshing = true
            }
        })
    }
}

// User agent
{
    const UA = navigator.userAgent
    const doc_classes = document.documentElement.classList
    window._useragent = {
        ios: /iPad|iPhone|iPod/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
        safari: /^((?!chrome|android).)*safari/i.test(UA),
        pwa: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone,
        is_touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0,
    }
    if (window._useragent.safari)
        doc_classes.add('safari')

    if (window._useragent.ios)
        doc_classes.add('ios')

    if (UA.includes('Firefox'))
        doc_classes.add('firefox')

    if (/Windows NT|Intel Mac OS X/.test(UA))
        doc_classes.add('non-mobile')
    else if (/Android.*Chrome\//.test(UA))
        doc_classes.add('chrome-android')
}

window.addEventListener('keydown', function check_tab(e) {
    if (e.key === 'Tab') {
        document.documentElement.classList.add('user-is-tabbing')
        window.removeEventListener('keydown', check_tab)
    }
})

/* On mobile: 100vh != 100% */
window._VH_OFFSET = 0
setTimeout(() => { window._VH_OFFSET = get_vh_offset() }, 100 + (window._useragent.ios ? 500 : 10))
