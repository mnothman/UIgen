<script>
    import * as kv from "idb-keyval";
    import { onMount } from "svelte";

    let deletedViews = [];

    onMount(async () => {
        const allViews = await kv.values();
        deletedViews = allViews.filter(view => view.deleted);
    });

    async function restoreView(viewId) {
        deletedViews = deletedViews.map(view => {
            if (view.id === viewId) {
                return { ...view, deleted: false };
            }
            return view;
        });
        await kv.set("view_" + viewId, deletedViews.find(v => v.id === viewId));
        deletedViews = deletedViews.filter(v => v.deleted);
    }

    async function permanentlyDeleteView(viewId) {
        deletedViews = deletedViews.filter(view => view.id !== viewId);
        await kv.del("view_" + viewId);
        console.log("Permanently deleted view", viewId);
    }
</script>

<div>
    <h1>Recently Deleted Items</h1>
    <a href="/" class="btn bg-blue-500 text-white p-2">Back to Home</a>

    {#each deletedViews as view}
        <div>
            <p>{view.revisions[0].prompt}</p>
            <button on:click={() => restoreView(view.id)}>Restore</button>
            <button on:click={() => permanentlyDeleteView(view.id)} class="btn bg-red-500 text-white p-2">Delete Permanently</button>
        </div>
    {/each}
</div>
