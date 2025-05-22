<script lang="ts">
    import Icon from "@iconify/svelte"
    import LibraryManager from "../LibraryManager.svelte";

    async function refresh() {
        LibraryManager.fetchItems()
    }
</script>

<button onclick={refresh} class="action action-refresh">
    <Icon icon="material-symbols:refresh"></Icon>
</button>

<style lang="scss">
    .action {
        height: 40px;
        width: 40px;
        font-size: var(--text-lg);
    }
</style>