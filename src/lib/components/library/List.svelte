<script lang="ts">
    import Item from "./Item.svelte";
    import LibraryManager from "./LibraryManager.svelte";

    LibraryManager.fetchItems()
</script>

<ul class="listContainer">
    {#each LibraryManager.ids as id }
        <Item id={id}></Item>
    {/each}
</ul>

<style lang="scss">
    .listContainer {

    }
</style>