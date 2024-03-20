<style>
  .container {
    display: flex;
    gap: 1rem;
    width: 100%;
    /* height: 90vh; Adjust the height of the container to take up most of the viewport height */

  }

  .history {
    /* flex-basis: 30%; */
    width: 255px;
    overflow-y: auto;
    height: 100vh; 
  }

  /* .current {
    flex-grow: 1;
    width: calc(100% - 180px - 1rem);
  } */
.current {
  flex-grow: 1;
  width: calc(100% - 240px - 1rem); /* Adjusted to account for the fixed width of the history panel */
  overflow: hidden; /* Prevents overflow outside this container */
  position: relative; /*Establishes a positioning context for absolutely positioned children if needed */
}

.current > div, .current > pre {
  max-height: 80vh; /* Adjust based on your needs to control the height */
  overflow: auto; /* Makes content scrollable if it exceeds the container's bounds */
  padding: 1rem;
  background-color: #f3f4f6; /* Matches the existing style for consistency */
  margin-bottom: 1rem; /* Space between elements */
}

.current > div {
  width: 100%; /* Ensures the div takes up the full width of its parent */
  box-sizing: border-box; /* Includes padding and border in the element's total width and height */
}

.current > pre {
  white-space: pre-wrap; /* Ensures that data is wrapped within the container */
  word-wrap: break-word; /* Breaks long words to prevent horizontal scrolling */
  max-width: 100%; /* Prevents the element from extending beyond its container */
}

  .revision {
    background-color: #fafafa; 
    padding: 1rem;
    margin-bottom: .1rem;
    margin-top: .1rem;
  }

  .tab-btn {
  background-color: #e2e8f0; 
  border: none;
  padding: 8px 16px;
  margin: 0 4px;
  cursor: pointer;
}

.tab-btn:focus {
  outline: none;
}

.tab-btn:hover {
  background-color: #cbd5e1; 
}
  .favorite-btn {
    transition: transform 0.3s ease, background-color 0.3s ease;
  }

  .favorite-btn.favorited {
    background-color: #ffc107; /* Or any highlight color */
    transform: scale(1.1); /* Slightly enlarge the button */
  }


</style>
<div class="container">
  <!-- History of chats on the left -->
  <!-- history needs to be for the current prompt which is clicked on, and then it is sorted by time stamps -->
  <div class="history">
    <!-- {#each [...view_data.revisions].sort((a, b) => b.isFavorite - a.isFavorite || b.timestamp - a.timestamp) as revision, index} -->
    {#each sortedRevisions as revision, index}

      <button type="button" class="revision" on:click={() => selectRevision(revision.timestamp)} on:keydown={(event) => handleKeyDown(event, index)}>

      <p><strong>Prompt:</strong> {revision.prompt}</p>
      <p><strong>Timestamp:</strong> {new Date(revision.timestamp).toLocaleString()}</p>
      </button>
  {/each}
  </div>

  <!-- display of rendered code and raw code, buttons  -->
  <div class="current">
    <input type="text" id="prompt" placeholder="Enter your prompt here" class="input bg-gray-100 p-2">
    <button on:click={genui} class="btn bg-blue-500 text-white p-2">Input Message</button>
    <a href="/" class="btn bg-blue-500 text-white p-2">Back to Home</a>
    <button class="copy-code-btn btn bg-blue-500 text-white p-2" on:click={copyCode}>Copy Code</button>
    <!-- <button class="copy-code-btn btn bg-blue-500 text-white p-2" on:click={toggleFavorite}>Favorite *</button> -->
    <button class="copy-code-btn btn bg-blue-500 text-white p-2" on:click={toggleFavorite}>
      {#if view_data.revisions.at(-1)?.isFavorite}Unfavorite{/if}
      {#if !view_data.revisions.at(-1)?.isFavorite}Favorite ⭐{/if}
    </button>


    {#if $isLoading}

    <div class="loading-spinner">
      <p>Loading...</p>
    </div>  
    {/if}

    {#if view_data.revisions.at(-1)}
<!-- display current prompt -->
    <div class="current-prompt">
      <strong>Current Prompt:</strong> {view_data.revisions.at(-1).prompt}
    </div>

    <!-- Tab buttons -->
    <div class="tab-buttons">
        <button on:click={() => switchTab('rendered')} class="tab-btn">Rendered Display</button>
        <button on:click={() => switchTab('raw')} class="tab-btn">Raw Code</button>
    </div>
  
    <!-- Conditional rendering based on the current tab -->
    {#if $currentTab === 'rendered'}
        <iframe srcdoc={'<script src=https://cdn.tailwindcss.com></script>\n' + view_data.revisions.at(-1).code} class="w-full h-[20rem] border m-5 shadow-2xl" title="Rendered Code"></iframe>
    {:else if $currentTab === 'raw'}
        <pre>{view_data.revisions.at(-1).code}</pre>
    {/if}
    {/if}
  </div>
</div>


<script>
import * as kv from 'idb-keyval'
import {openai} from './store.js'
import { writable } from 'svelte/store';

//when button clicked, triggers genui function, takes user input, sends to openai, and returns the response
async function genui() {
    isLoading.set(true);
    let prompt = document.getElementById('prompt').value
    let fullPrompt = prompt
    const system_prompt = 'You are a helpful assistant. You create html and tailwind css from a chat. Use only Tailwind for styling. Only respond with HTML! Do not explain anything.'
    
    try{
    const prev_code = view_data.revisions.at(-1)?.code || ''
    if (prev_code) {
        fullPrompt = `${prompt}; apply the change to the following code:\n${prev_code}`
    }
    console.log(fullPrompt)
    const response = await $openai.chat.completions.create({
        messages: [
            {role: 'system', content: system_prompt},
            {role: 'user', content: fullPrompt},
        ],
        model: 'gpt-3.5-turbo',
    })
    const newRevision = {
        id,
        timestamp: Date.now(),
        prompt,
        code: response.choices[0].message.content,
        isFavorite: false, 
    };
    newRevision.code = newRevision.code.replace(/^```html\n/, '').replace(/\n```\s*$/, '');

    // Push the new revision onto the revisions array
    view_data.revisions.push(newRevision);

    // Update IndexedDB
    kv.set('view_' + id, view_data);

    console.log(newRevision.code);
    view_data = { ...view_data, revisions: [...view_data.revisions] };
  } catch (error) {
    console.error('Error:', error);
  } finally {
    isLoading.set(false); // Reset loading state
  }
 }

export let id
let isLoading = writable(false);
let view_data = {id, revisions: []}
let is_new = false
let sortedRevisions = [];
const currentTab = writable('rendered'); 
function switchTab(tabName) {
    currentTab.set(tabName);
}



;(async () => {
    view_data = await kv.get('view_' + id)
    if (!view_data) {
        view_data = {id, revisions: []}
        is_new = true
    }
    console.log(view_data)
})()

function copyCode() {
    const code = view_data.revisions.at(-1)?.code || '';
    if (code) {
        navigator.clipboard.writeText(code).then(() => {
            console.log('Code copied to clipboard!');
        }).catch(err => {
            console.error('Error copying code to clipboard:', err);
        });
    }
}

function toggleFavorite() {
  // const currentRevision = view_data.revisions.at(-1);
  // const allRevisions = view_data.revisions;
  // if (currentRevision) {
  //   currentRevision.isFavorite = !currentRevision.isFavorite;
  //   allRevisions.isFavorite = !allRevisions.isFavorite;
  //   kv.set('view_' + id, view_data); //persistance to indexedDB
  //   view_data = { ...view_data }; //for reactivity
  // }
  // previous code does not account for the last most data revision being changed to one that is false, since we only changed the top to true and vice versa
  const currentRevisionIndex = view_data.revisions.length - 1; // Last item 
  const currentRevision = view_data.revisions[currentRevisionIndex];
  
  if (currentRevision) {
    //toggle the favorite status of the currentRevision
    currentRevision.isFavorite = !currentRevision.isFavorite;

    // Now toggle the favorite status of all other revisions
    view_data.revisions.forEach((revision, index) => {
      if (index !== currentRevisionIndex) { // Skip the currentRevision
        revision.isFavorite = currentRevision.isFavorite; // Apply the currentRevision's new favorite status to all others
      }
    });

    //persist the updated revisions array to IndexedDB
    kv.set('view_' + id, view_data);

    // update view_data to trigger Svelte reactivity
    view_data = { ...view_data, revisions: [...view_data.revisions] };
  }
}


// HAVE TO CHANGE THE WAY THAT WE DEAL WITH CURRENT REVISIONS BECASUE WE STILL WOULD BE INPUTTING THE MOST RECENT CODE IN THE PROMPT INSTEAD OF THE CURRENT REVISION, HAVE TO ADD AN IF STATEMENT
function selectRevision(timestamp) {
  // find the revision by timestamp
  const revisionIndex = view_data.revisions.findIndex(revision => revision.timestamp === timestamp);
  
  if (revisionIndex === -1) return; // Exit if no revision matches the timestamp
  
  // retrieve  selected revision 
  const selectedRevision = view_data.revisions.splice(revisionIndex, 1)[0];
  view_data.revisions.push(selectedRevision); // Move it to the end to be the current revision

  // move the selected revision to the top/start of the array THIS WAS TO MAKE IT GO TO THE ZERO INDEX WHICH IS WRONG
  // view_data.revisions.unshift(selectedRevision);
  
  //ui changes
  view_data = { ...view_data, revisions: [...view_data.revisions] };
  
  // Persist changes indexb
  kv.set('view_' + id, view_data);
  view_data = { ...view_data, revisions: [...view_data.revisions] }; //need this for updating reactivity so that it can dispaly 

}



function handleKeyDown(event, index) {
//needed for ally error
  if (event.key === 'Enter') {
    selectRevision(index);
  }
}


function sortRevisions() {
    const currentRevision = view_data.revisions.at(-1);
    const otherRevisions = view_data.revisions.slice(0, -1).sort((a, b) => b.timestamp - a.timestamp);
    sortedRevisions = [currentRevision, ...otherRevisions];
  }
//reactive, make changes whenever done
  $: if (view_data.revisions.length) {
    sortRevisions();
  }


</script>


