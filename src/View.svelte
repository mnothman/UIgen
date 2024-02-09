<input type="text" id="prompt" placeholder="Enter your prompt here">
<button on:click={genui}>Generate UI</button>

{#if view_data.revisions.at(-1)}
<pre class="bg-gray-100 p-4">
  {view_data.revisions.at(-1).code}
</pre>

<div class="bg-gray-100 p-4">
  {@html view_data.revisions.at(-1).code}
</div>
{/if}

{#each view_data.revisions as revision}
  {revision.prompt}
{/each}

<script>
import * as kv from 'idb-keyval'
import {openai} from './store.js'

async function genui() {
    const prompt = document.getElementById('prompt').value
    const system_prompt = 'You are a helpful assistant. You create html and tailwind css from a chat. Use only Tailwind for styling. Only respond with HTML! Do not explain anything.'
    const response = await $openai.chat.completions.create({
        messages: [
            {role: 'system', content: system_prompt},
            {role: 'user', content: prompt},
            // {role: 'user', content: 'make it green. apply the change to the following code:\n\n<code>'},
        ],
        model: 'gpt-3.5-turbo',
        // model: 'codellama/CodeLlama-70b-Instruct-hf',
    })

    view_data.revisions.push({id, prompt, code: response.choices[0].message.content})
    view_data = view_data
    if (is_new) {
        kv.set('view_' + id, view_data)
    }
    console.log(response.choices[0].message.content)
    // return {code: response.choices[0].message.content}
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
