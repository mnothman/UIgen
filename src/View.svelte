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
    <input type="text" id="prompt" placeholder={placeholder} class="input-prompt"  on:keydown={handleEnterPress} bind:value={promptInput}>
    <button on:click={genui} class="btn bg-blue-500 text-white p-2">Input Message</button>
    <a href="/" class="btn bg-blue-500 text-white p-2">Back to Home</a>

    <!-- <button class="copy-code-btn btn bg-blue-500 text-white p-2" on:click={copyCode}>Copy Code</button>
    <button class="copy-code-btn btn bg-blue-500 text-white p-2" on:click={toggleFavorite}>
      {#if view_data.revisions.at(-1)?.isFavorite}Unfavorite{/if}
      {#if !view_data.revisions.at(-1)?.isFavorite}Favorite ⭐{/if}
    </button> -->

    <!-- if theres no data in the revisions array it means theres a new chat, so dont need copy code or favorite button -->
    {#if view_data.revisions.length > 0} 
        <button class="copy-code-btn btn bg-blue-500 text-white p-2" on:click={copyCode}>Copy Code</button>
        <button class="copy-code-btn btn bg-blue-500 text-white p-2" on:click={toggleFavorite}>
          {#if view_data.revisions.at(-1)?.isFavorite}Unfavorite{/if}
          {#if !view_data.revisions.at(-1)?.isFavorite}Favorite ⭐{/if}
        </button>
    {/if}

    {#if $isLoading}

    <div class="loading-spinner">
      <p>Loading...</p>
    </div>  
    {/if}

    {#if view_data.revisions.at(-1)}
<!-- display current prompt -->
    <div class="current-prompt-container">
      <strong>Current Prompt:</strong> {view_data.revisions.at(-1).prompt}
    </div>

    <!-- Tab buttons -->
    <div class="tab-buttons">
        <button on:click={() => switchTab('rendered')} class="tab-btn">Rendered Display</button>
        <button on:click={() => switchTab('raw')} class="tab-btn">Raw Code</button>
    </div>
  
    {#if $currentTab === 'rendered'}
        <iframe srcdoc={'<script src=https://cdn.tailwindcss.com></script>\n' + view_data.revisions.at(-1).code} class="w-full h-[29rem] border m-7 shadow-2xl" title="Rendered Code"></iframe>
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

let promptInput = ''; 
let placeholder = 'Enter your prompt here';

  function getRandomExample() {
    const examples = [
      "Build a simple, intuitive recipe page layout for a cooking website.",
        "Invent a futuristic control panel UI for smart home devices.",
        "Develop a sleek profile page UI for a professional networking site.",
        "Example prompt 4",
        "Example prompt 5",
        "Example prompt 6",
        "Example prompt 7",
        "Example prompt 8",
        "Example prompt 9",
        "Example prompt 10"
    ];
    return examples[Math.floor(Math.random() * examples.length)];
  }

  onMount(async () => {
    placeholder = getRandomExample();
  });
 

//when button clicked, triggers genui function, takes user input, sends to openai, and returns the response
async function genui() {
    isLoading.set(true);
    let prompt = document.getElementById('prompt').value
    let fullPrompt = prompt
    // const system_prompt = 'You are a helpful assistant. You create html and tailwind css from a chat. Use only Tailwind for styling. Only respond with HTML! Do not explain anything.'
    const system_prompt = 'You are a helpful assistant skilled in web design, focusing on creating HTML structures styled with Tailwind CSS. Your task is to generate the HTML for complete website designs that are responsive, adhering to modern web standards. All styling should be achieved using Tailwind CSS classes, aiming for a clean, accessible, and visually appealing outcome. Make it loaded with features, if needed the sites you design should include a navigation bar, homepage content, about section, contact form, and footer. Ensure the layout is responsive, catering to mobile, tablet, and desktop views. Keep the design intuitive for users, incorporating basic accessibility features where possible. Only provide the HTML and Tailwind CSS code necessary for these designs, without any explanations.'
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

// for pressing enter to submit
  function handleEnterPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      genui();
    }
  }

</script>

<style>

  .container {
    display: flex;
    gap: 1rem;
    width: 100%;
    background-color: #fdfdfd; /* changes the entire background behind everything*/
    /* height: 90vh;  */
  }

  .history {
    width: 255px;
    overflow-y: auto;
    height: 100vh; 
  }

.current {
  flex-grow: 1;
  background-color: #fdfdfd;
  width: calc(100% - 240px - 1rem); /*Adjusted to account for the fixed width of the history panel */
  overflow: hidden; /* Prevents overflow outside this container */
  position: relative; /*Establishes a positioning context for absolutely positioned children if needed */
}

.current > div, .current > pre {
  max-height: 80vh; /* Adjust based on your needs to control the height */
  overflow: auto; /* Makes content scrollable if it exceeds the container's bounds */
  padding: 1rem;
  background-color: #fcfcfc; /* fcfcfc THESE CHANGE THE TWO LINES WITH CURRENT PROMPT AND 2 BUTTONS */
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
    background-color: #fdfdfd; 
    padding: 1rem;
    margin-bottom: .1rem;
    margin-top: .1rem;
  }

  .tab-btn {
  background-color: #fdfdfd; 
  border: none;
  padding: 8px 16px;
  margin: 0 4px;
  cursor: pointer;
}

.tab-btn:focus {
  outline: none;
}

.tab-btn:hover {
  background-color: #fdfdfd; 
}

.btn {
    background-color: #007bff; /* Blue background */
    color: rgb(83, 81, 81); /* White text */
    padding: 10px 25px; /* Padding */
    text-align: center; /* Center text */
    text-decoration: none; /* No underline */
    display: inline-block; /* Allows setting dimensions */
    font-size: 16px; /* Text size */
    cursor: pointer; /* Cursor appearance */
    border-radius: 5px; /* Rounded corners */
    transition: background-color 0.3s; /* Smooth color transition */
    border: none; /* No border */
}

.input-prompt {
    margin-top: 1rem; /* Space below the prompt */
    margin-bottom: 1rem; /* Keeps the original space below the prompt */
    padding: 8px 20px; /* Adjusts padding to make the input box smaller */
    font-size: 16.4px;
  }


  .tab-btn {
  background-color: #fdfdfd;
  border: none;
  padding: 8px 16px;
  margin: 0 4px;
  cursor: pointer;
  box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.2); /* Shadow effect */
}

.tab-buttons{
  background-color: #fdfdfd;
  border: none;
  padding: 8px 16px;
  margin: 0 4px;
  cursor: pointer;
  box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.2); /* Shadow effect */
}

.history {
  width: 255px;
  overflow-y: auto;
  height: 100vh;
  background-color: #fdfdfd;
  box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.2); /* Shadow effect */
}

.current-prompt-container {
  background-color: #fdfdfd;
  border: none;
  padding: 8px 16px;
  margin: 0 4px;
  cursor: pointer;
  box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.2); /* Shadow effect */
}

.revision {
    background-color: #faf9f9; 
    padding: 1rem;
    margin-bottom: .1rem;
    margin-top: .1rem;
  }

</style>
