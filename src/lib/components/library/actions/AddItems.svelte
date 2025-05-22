<script>
    import Icon from "@iconify/svelte";
    import LibraryManager from "../LibraryManager.svelte";

    async function addItems() {
        LibraryManager.addItems()
    }
</script>

<button onclick={addItems} class="action action-add">
    <Icon icon="material-symbols:note-add"></Icon>
</button>

<style lang="scss">
    .action {
        height: 40px;
        width: 40px;
        font-size: var(--text-lg);
    }
</style>