<script>
    export let showModal;
    export let onConfirm;
    export let onCancel;

    function handleConfirm() {
        onConfirm();
    }

    function handleCancel() {
        onCancel();
    }
</script>

{#if showModal}
<div class="modal">
    <div class="modal-content">
        <h5 class="modal-title">Confirm Deletion</h5>
        <div class="modal-body">
            Are you sure you want to delete this chat?
        </div>
        <div class="modal-footer">
            <button class="confirmDeleteButton" on:click={handleConfirm}>Confirm Delete</button>
            <button class="confirmCancelButton" on:click={handleCancel}>Cancel</button>
        </div>
    </div>
</div>
{/if}

<style>
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal-content {
        background: white;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
        width: auto;
        text-align: center;
    }

    button {
        margin-right: 10px;
    }

    .modal-body {
        margin-bottom: 20px;
    }

    .modal-footer {
        display: flex;
        justify-content: center;
    }

    .confirmDeleteButton, .confirmCancelButton {
        background-color: #dc3545;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        flex-grow: 1;
        margin: 0 5px;
    }

    .confirmCancelButton {
        background-color: #e0e4e7;
    }

    button:last-child {
        margin-right: 0;
    }

</style>
