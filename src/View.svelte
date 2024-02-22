<style>
  .container {
    display: flex;
    gap: 1rem;
    width: 100%;
    /* height: 90vh; Adjust the height of the container to take up most of the viewport height */

  }

  .history {
    /* flex-basis: 30%; */
    width: 240px;
    overflow-y: auto;
    height: 90vh; 
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
    background-color: #757575; 
    padding: 1rem;
    margin-bottom: 1rem;
  }


</style>

<div class="container">
  <!-- History of chats on the left -->
  <div class="history">
    <!-- {#each view_data.revisions as revision, index} -->
    {#each [...view_data.revisions].reverse() as revision, index}
      <div class="revision">
        <p><strong>Prompt:</strong> {revision.prompt}</p>
        <p><strong>Timestamp:</strong> {new Date(revision.timestamp).toLocaleString()}</p>
        <!-- somewhere here the html isnt working for the current page -->
      </div>
    {/each}
  </div>

  <div class="current">
    <input type="text" id="prompt" placeholder="Enter your prompt here" class="input bg-gray-100 p-2">
    <button on:click={genui} class="btn bg-blue-500 text-white p-2">Input Message</button>

    {#if view_data.revisions.at(-1)}
      <div class="bg-gray-100 p-4">{@html view_data.revisions.at(-1).code}</div>
<!-- raw html -->
      <pre>{view_data.revisions.at(-1).code}</pre>
    {/if}
  </div>
</div>


<script>
import * as kv from 'idb-keyval'
import {openai} from './store.js'


//when button clicked, triggers genui function, takes user input, sends to openai, and returns the response
async function genui() {
    const prompt = document.getElementById('prompt').value
    const system_prompt = 'You are a helpful assistant. You create html and tailwind css from a chat. Use only Tailwind for styling. Only respond with HTML! Do not explain anything.'
    const lastRevision = view_data.revisions.at(-1)
    const previousCode = lastRevision ? lastRevision.code : "";
    const fullPrompt = `Previous code:\n${previousCode}\n\nNew user prompt: ${prompt}`;
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
    };

    // Push the new revision onto the revisions array
    view_data.revisions.push(newRevision);

    // Update IndexedDB
    kv.set('view_' + id, view_data);

    console.log(newRevision.code);
    view_data = { ...view_data, revisions: [...view_data.revisions] };

 }

export let id
let view_data = {id, revisions: []}
let is_new = false

;(async () => {
    view_data = await kv.get('view_' + id)
    if (!view_data) {
        view_data = {id, revisions: []}
        is_new = true
    }
    console.log(view_data)
})()
</script>
