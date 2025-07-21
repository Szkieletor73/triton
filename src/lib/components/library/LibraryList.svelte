<script lang="ts">
    let { items } = $props();
    import LibraryItem from "./LibraryItem.svelte";

</script>

<ul class="library-list-container">
    {#each items as id (id)}
        <LibraryItem itemId={id}></LibraryItem>
    {/each}
</ul>

<style lang="scss">
    .library-list-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        max-width: 100%;
    }
</style>