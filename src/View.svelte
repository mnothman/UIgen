<style>
  .container {
    display: flex;
    gap: 1rem;
  }

  .history {
    flex-basis: 30%;
    overflow-y: auto;
    height: 90vh; 
  }

  .current {
    flex-grow: 1;
  }

  .revision {
    background-color: #f3f4f6; 
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .truncated {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* .truncated {
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
} */

</style>

<div class="container">
  <!-- History of chats on the left -->
  <div class="history">
    {#each view_data.revisions as revision, index}
      <div class="revision">
        <p><strong>Prompt:</strong> {revision.prompt}</p>
        <p><strong>Timestamp:</strong> {new Date(revision.timestamp).toLocaleString()}</p>
        <pre>{revision.code}</pre>

        {#if $expandedRevisions[index]}
          <pre>{revision.code}</pre>
          <button on:click={() => toggleExpansion(index)}>Show less</button>
        {:else}
          <div class="truncated">
            <pre>{revision.code}</pre>
            <button on:click={() => toggleExpansion(index)}>...</button>
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Current prompt and response in the middle -->
  <div class="current">
    <input type="text" id="prompt" placeholder="Enter your prompt here" class="input bg-gray-100 p-2">
    <button on:click={genui} class="btn bg-blue-500 text-white p-2">Input Message</button>

    {#if view_data.revisions.at(-1)}
    <!-- this line below is what shows the code at bottom of screen -->
    <div class="bg-gray-100 p-4">{@html view_data.revisions.at(-1).code}</div>
    {#if currentExpanded}
      <pre class="bg-gray-100 p-4">{view_data.revisions.at(-1).code}</pre>
      <button on:click={toggleCurrentExpansion}>Show less</button>
    {:else}
      <div class="truncated bg-gray-100 p-4">
        <pre>{view_data.revisions.at(-1).code}</pre>
        <button on:click={toggleCurrentExpansion}>...</button>
      </div>
    {/if}
  {/if}
</div>
</div>


<script>
import * as kv from 'idb-keyval'
import {openai} from './store.js'
import { writable } from 'svelte/store';

let expandedRevisions = writable({});
let currentExpanded = false;

function toggleExpansion(index) {
    expandedRevisions.update(current => {
      const newState = !current[index];
      return { ...current, [index]: newState };
    });
  }

  function toggleCurrentExpansion() {
    currentExpanded = !currentExpanded;
  }


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

