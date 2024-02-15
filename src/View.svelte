<input type="text" id="prompt" placeholder="Enter your prompt here">
<button on:click={genui}>Input Message</button>

{#if view_data.revisions.at(-1)}
<pre class="bg-gray-100 p-4">
  {view_data.revisions.at(-1).code}
</pre>

<div class="bg-gray-100 p-4">
  {@html view_data.revisions.at(-1).code}
</div>
{/if}

<!-- need to find a way to make the history cleaner -->
<!-- displays all recent promps and code at end -->
{#each view_data.revisions as revision}
  {revision.prompt}
  {revision.code}
{/each}

<script>
import * as kv from 'idb-keyval'
import {openai} from './store.js'

//when button clicked, triggers genui function, takes user input, sends to openai, and returns the response
async function genui() {
    const prompt = document.getElementById('prompt').value
    const system_prompt = 'You are a helpful assistant. You create html and tailwind css from a chat. Use only Tailwind for styling. Only respond with HTML! Do not explain anything.'
    // const response = await $openai.chat.completions.create({
    //     messages: [
    //         {role: 'system', content: system_prompt},
    //         {role: 'user', content: prompt},
    //         // {role: 'user', content: 'make it green. apply the change to the following code:\n\n<code>'},
    //     ],
    //     model: 'gpt-3.5-turbo',
    //     // model: 'codellama/CodeLlama-70b-Instruct-hf',
    // })
    //loops through the revisions array and pushes the id, prompt, and response to the array
    //appends new revision and generated code to local storage with new view_data (if new view)
    // view_data.revisions.push({id, prompt, code: response.choices[0].message.content})
    const lastRevision = view_data.revisions.at(-1)
    const previousCode = lastRevision ? lastRevision.code : "";
    const fullPrompt = `Previous code:\n${previousCode}\n\nNew user prompt: ${prompt}`;
    const response = await $openai.chat.completions.create({
        messages: [
            {role: 'system', content: system_prompt},
            {role: 'user', content: fullPrompt},
            // {role: 'user', content: 'make it green. apply the change to the following code:\n\n<code>'},
        ],
        model: 'gpt-3.5-turbo',
        // model: 'codellama/CodeLlama-70b-Instruct-hf',
    })
    const newRevision = {
        id,
        timestamp: Date.now(), // Use a more unique identifier if needed
        prompt,
        code: response.choices[0].message.content,
    };

    // Push the new revision onto the revisions array
    view_data.revisions.push(newRevision);

    // Update IndexedDB
    kv.set('view_' + id, view_data);

    console.log(newRevision.code);
    view_data = { ...view_data, revisions: [...view_data.revisions] };

    // view_data = view_data
    // if (is_new) {
    //     kv.set('view_' + id, view_data)
    // } else if (!is_new) {
    //   view_data.revisions.push(newRevision);
//       // view_data.revisions.push({id, prompt, code: response.choices[1].message.content}) //what we need to do is to pass in the previous code with the new prompt, 
//       //and have it display the entire code back with new changes instead of just the new code. also need to deal with how to make the response.choices[++ to work] 
    // }
//     // console.log(response.choices[0].message.content)
//     // return {code: response.choices[0].message.content}
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


<!-- old code -->

<!-- <input type="text" id="prompt" placeholder="Enter your prompt here">
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
    //loops through the revisions array and pushes the id, prompt, and response to the array
    //appends new revision and generated code to local storage with new view_data (if new view)
    view_data.revisions.push({id, prompt, code: response.choices[0].message.content})
   
    view_data = view_data
    if (is_new) {
        kv.set('view_' + id, view_data)
    } else if (!is_new) {
      view_data.revisions.push({id, prompt, code: response.choices[1].message.content}) //what we need to do is to pass in the previous code with the new prompt, 
      //and have it display the entire code back with new changes instead of just the new code. also need to deal with how to make the response.choices[++ to work] 
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
</script> -->
