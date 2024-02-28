<!--home page with list of revisions -->
{#if !$state.api_key}
  <button class="btn" on:click={() => $state.api_key = window.prompt('Enter your OpenAI API key')}>Set Key</button>
{/if}
{#if $state.api_key}
  <button class="btn" on:click={() => $state.api_key = window.prompt('Change your OpenAI API key')}>Change Key</button>
{/if}

<button class="btn" on:click={new_view}>New Chat</button>

<div>Past revisions</div>

<div class="grid-container">
    {#each sortedViews as view}
    <!-- {#each views as view} -->
    <div class="grid-item">
        <a href="/view/{view.id}">
                            <!-- <iframe  /> and /or <div class="rendered-code">...</div> -->

                <!-- place holder for rendered code-->
                {#if view.revisions.some(rev => rev.isFavorite)}
                <span>⭐</span>
            {/if}
            <p>{view.revisions[0].prompt}</p>
            {@html view.revisions[0].code} 
            <span>{view.revisions.length} revisions</span>
            <span>{new Date(view.revisions[0].timestamp).toLocaleString()}</span>
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

$: sortedViews = views.sort((a, b) => {
  const aFav = a.revisions.some(rev => rev.isFavorite) ? 1 : 0;
  const bFav = b.revisions.some(rev => rev.isFavorite) ? 1 : 0;
  return bFav - aFav || b.revisions[0].timestamp - a.revisions[0].timestamp;
});


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
    
    /* Set fixed dimensions */
    width: 260px; /* Adjust width as needed */
    height: 250px; /* Adjust height as needed */
    
    /* Handling overflow */
    overflow: hidden; /* Hide overflow. Alternatively, use 'auto' to add scrollbars */
    
    display: flex;
    flex-direction: column;
}

.grid-item a {
    display: block;
    text-decoration: none;
    color: inherit;
    overflow: hidden; /* Ensures that content does not overflow the link boundary */
}

.rendered-code, iframe {
    max-height: 100%; /* Adjust based on your needs */
    overflow: auto; /* Adds a scrollbar if content exceeds this height */
}

/* Additional styles for text truncation and layout */
.grid-item p, .grid-item span {
    margin: 0;
    padding: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Adjustments for rendered code to ensure it fits within the layout */
.rendered-code {
    font-size: 0.75rem; /* Smaller font size for code */
    white-space: nowrap; /* Adjust based on preference */
    overflow-x: auto; /* Horizontal scrolling for single lines of code */
}



</style>
