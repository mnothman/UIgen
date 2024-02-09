{#if !$state.api_key}
  <button class=btn on:click={open_set_key_modal}>Set Key</button>
{/if}

<button class=btn on:click={new_view}>New View</button>

<ul class="list-disc ms-2">
    {#each views as view}
        <li><a href="/view/{view.id}">{view.revisions[0].prompt}</a></li>
    {/each}
</ul>

<script>
import {state} from './store.js'
import * as kv from 'idb-keyval'
import {router} from 'tinro'

let views = []

;(async () => {
    views = (await kv.values()).filter(v => v.revisions)
})()

const open_set_key_modal = () => {}
function new_view() {
    const id = Date.now()
    // kv.set('view_' + id, {id})
    router.goto('/view/' + id)
}
</script>
