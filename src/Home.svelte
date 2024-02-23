<!--home page with list of revisions -->
{#if !$state.api_key}
  <button class="btn" on:click={() => $state.api_key = window.prompt('Enter your OpenAI API key')}>Set Key</button>
{/if}

<button class="btn" on:click={new_view}>New Chat</button>

<div>Past revisions</div>

<div class="grid-container">
    {#each views as view}
        <div class="grid-item">
            <a href="/view/{view.id}">
                <p>{view.revisions[0].prompt}</p>
                <!-- place holder for rendered code-->
                <!-- <iframe  /> and /or <div class="rendered-code">...</div> -->
                <span>{new Date(view.revisions[0].timestamp).toLocaleDateString()}</span>
            </a>
        </div>
    {/each}
</div>

<script>
import {state} from './store.js';
import * as kv from 'idb-keyval';
import {router} from 'tinro';

let views = [];

;(async () => {
    views = (await kv.values()).filter(v => v.revisions && v.revisions.length);
})();

function new_view() {
    const id = Date.now();
    router.goto('/view/' + id);
}
</script>

<style>
.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
    gap: 1rem;
    padding: 1rem;
}

.grid-item {
    border: 1px solid #ccc;
    padding: 1rem;
    background-color: #f9f9f9;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.grid-item a {
    display: block;
    text-decoration: none;
    color: inherit;
}

.rendered-code, iframe {
    max-height: 150px; 
    overflow: auto; 
}
</style>
