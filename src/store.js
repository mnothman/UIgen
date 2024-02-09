import OpenAi from 'openai'
import {writable, get} from 'svelte/store'
import * as kv from 'idb-keyval'
import {debounce} from 'components/src/util.js'

export const openai = writable(null)
export const state = writable({
    api_key: '',
})
export const views = writable({})
export const session = writable({
    loaded: false,
})

;(async function init() {
    const state_idb = await kv.get('state')
    if (state_idb) {
        state.set(state_idb)
        if (state_idb.api_key)
            init_openai()
    }
    init_openai()

    session.update(v => ({...v, loaded: true}))
})()

state.subscribe(debounce(data => {
    kv.set('state', data)
}, 200))

export function init_openai() {
    const $state = get(state)
    const openai_conn = new OpenAi({
        apiKey: $state.api_key,
        apiKey: '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',
        // dangerouslyAllowBrowser: true,
    })
    openai.set(openai_conn)
}
