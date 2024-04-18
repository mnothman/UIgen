<script>
    import { state } from "./store.js";
    import * as kv from "idb-keyval";
    import { router } from "tinro";
    import { del } from "idb-keyval";
    import ConfirmationModal from "./ConfirmationModal.svelte";

    let views = [];
    let showModal = false;
    let pendingDeleteId;

    (async () => {
        views = (await kv.values()).filter(
            (v) => v.revisions && v.revisions.length,
        );
    })();

    function new_view() {
        const id = Date.now();
        router.goto("/view/" + id);
    }

    $: sortedViews = views.sort((a, b) => {
        const aFav = a.revisions.some((rev) => rev.isFavorite) ? 1 : 0;
        const bFav = b.revisions.some((rev) => rev.isFavorite) ? 1 : 0;
        return (
            bFav - aFav || b.revisions[0].timestamp - a.revisions[0].timestamp
        );
    });

    function handleDelete(event, viewId) {
        event.preventDefault();
        event.stopPropagation();
        showModal = true;
        pendingDeleteId = viewId;
    }

    async function confirmDeletion() {
        views = views.filter((view) => view.id !== pendingDeleteId);
        await del("view_" + pendingDeleteId);
        console.log("Deleted view_" + pendingDeleteId);
        showModal = false;
    }

    function cancelDeletion() {
        console.log("Deletion cancelled");
        showModal = false;
    }
</script>

<header>
    <h1>Revision History</h1>
    <div>
        {#if !$state.api_key}
            <button
                class="btn"
                on:click={() =>
                    ($state.api_key = window.prompt(
                        "Enter your OpenAI API key",
                    ))}>Set Key</button
            >
        {/if}
        {#if $state.api_key}
            <button
                class="btn"
                on:click={() =>
                    ($state.api_key = window.prompt(
                        "Change your OpenAI API key",
                    ))}>Change Key</button
            >
        {/if}
        <button class="btn" on:click={new_view}>New Chat</button>
    </div>
</header>

<div class="grid-container">
    {#each sortedViews as view}
        <div class="grid-item">
            <div class="content-link">
                <a href="/view/{view.id}">
                    {#if view.revisions.some((rev) => rev.isFavorite)}
                        <span>⭐</span>
                    {/if}
                    <p>{view.revisions[0].prompt}</p>
                    <div class="rendered-code">
                        {@html view.revisions[0].code}
                    </div>
                    <span>{view.revisions.length} revisions</span>
                    <span
                        >{new Date(
                            view.revisions[0].timestamp,
                        ).toLocaleString()}</span
                    >
                </a>
            </div>
            <button
                class="deleteButton"
                on:click={(event) => handleDelete(event, view.id)}
                >Delete</button
            >
        </div>
    {/each}

    <ConfirmationModal
        {showModal}
        onConfirm={confirmDeletion}
        onCancel={cancelDeletion}
    />
</div>

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
        /* border: none; */
        color: rgb(0, 0, 0);
        padding: 10px 25px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        /* font-size: 16px; */
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

    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        /* margin-bottom: 20px; */
    }
    /*     
    header > div {
        display: flex;
        gap: 10px;
    } */

    /* h1 {
        font-size: 24px;
        color: #333;
    }
     */
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
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        max-height: 500px;
        min-width: 2px;
        overflow: hidden; /* Keeps the content within the boundaries */
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: transform 0.2s;
        position: relative;
        height: auto;
    }

    .grid-item:hover {
        transform: translateY(-5px);
    }

    .grid-item a {
        color: inherit;
        text-decoration: none;
    }

    /* .grid-item p, .grid-item span, .rendered-code { */
    /* font-size: larger; Adjust as needed */
    /* } */

    /* star and revisions styling */
    .grid-item span:first-child {
        font-size: 17px;
        position: absolute;
        top: 10px;
        left: 10px;
        border-radius: 10px;
        cursor: pointer;
    }

    /* date and revisions count */
    .grid-item span:last-child {
        font-size: 0.85rem;
        color: #666;
    }

    .rendered-code {
        font-size: smaller;
        overflow: hidden;
        overflow-y: hidden;
        overflow-x: hidden;
    }

    .deleteButton {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: #ff0000;
        color: #fff;
        border: none;
        padding: 2px 4px;
        font-size: 16px;
        border-radius: 10px;
        cursor: pointer;
        transition: background-color 0.3s;
    }
</style>
