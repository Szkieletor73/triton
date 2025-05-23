<script lang="ts">
    import Item from "./Item.svelte"
    import LibraryManager from "./LibraryManager.svelte"
</script>

<article class="listContainer">
    <ul class="list">
        {#each LibraryManager.ids as id }
            <Item id={id}></Item>
        {/each}
    </ul>
</article>

<style lang="scss">
    @use "$lib/styles/mixins/generic";

    .listContainer {
        padding: 16px;

        overflow-y: auto;
    }

    .list {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-start;
        gap: 4px;
    }
</style>