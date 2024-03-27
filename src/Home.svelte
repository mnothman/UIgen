<header>
    <h1>Revision History</h1>
    <div>
        {#if !$state.api_key}
        <button class="btn" on:click={() => $state.api_key = window.prompt('Enter your OpenAI API key')}>Set Key</button>
        {/if}
        {#if $state.api_key}
        <button class="btn" on:click={() => $state.api_key = window.prompt('Change your OpenAI API key')}>Change Key</button>
        {/if}
        <button class="btn" on:click={new_view}>New Chat</button>
    </div>
</header>

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
    header h1 {
        font-weight: bold; 
        text-align: left; 
        margin-left: 40px; 
        margin-top: 20px;
        font-size: 50px; 
    }
        
/* 
    body {
        font-family: 'Arial', sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f0f4f8;
    } */
    
    .btn {
        background-color: #007bff;
        border: none;
        color: rgb(0, 0, 0);
        padding: 10px 25px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 25px 4px 4px;
        cursor: pointer;
        border-radius: 5px;
        transition: background-color 0.3s;
        position: relative;
        left: -20px;
    }
    
    .btn:hover {
        background-color: #0056b3;
    }
    
    /* Improved layout and typography for the header */
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    header > div {
        display: flex;
        gap: 10px;
    }
    
    h1 {
        font-size: 24px;
        color: #333;
    }
    
    /* Grid and item styling adjustments */
    .grid-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); 
        gap: 20px;
        padding: 1rem;
    }
    
    .grid-item {
    border: 1px solid #ccc;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    border-radius: 8px;
    overflow: hidden; /* Keeps the content within the boundaries */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.2s; /* Smooth transition for hover effect */
    position: relative; /* Ensures that the layout is maintained */
    height: auto; /* Adjust height automatically based on content */
}

    .grid-item:hover {
        transform: translateY(-5px);
    }
    
    .grid-item a {
        color: inherit;
        text-decoration: none;
    }
    
    .grid-item p, .grid-item span {
        margin: 5px 0;
    }
    
    /* Star and Revisions styling */
    .grid-item span:first-child {
        font-size: 20px;
        line-height: 1;
    }
    
    /* Date and revisions count */
    .grid-item span:last-child {
        font-size: 0.85rem;
        color: #666;
    }
    
    </style>
    