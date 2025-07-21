<script lang="ts">
    import LibraryList from "./LibraryList.svelte"
    import LibraryMenu from "./LibraryMenu.svelte"
    import LibraryManager from "$lib/components/library/LibraryManager.svelte"
    import { onMount } from "svelte";

    onMount(() => {
        LibraryManager.fetchItems()
    })
    
    const filteredIds: number[] = $derived(LibraryManager.getIds())
</script>

<div class="library-container">
    <LibraryMenu></LibraryMenu>

    {#if filteredIds.length}
        <LibraryList items={filteredIds}></LibraryList>
    {:else}
        <div class="library-no-results">
            <h1>SORRY NOTHING</h1>
            <h2>No results have been found.</h2>
        </div>
    {/if}
</div>

<style lang="scss">
    .library-container {
        display: flex;
        flex-direction: column;
        position: relative;
    }

    .library-no-results {
        position: absolute;
        top: 128px;
        left: 0;
        right: 0;

        opacity: 0.3;
        pointer-events: none;
        user-select: none;

        & h1, & h2 {
            margin: auto;
            display: block;
            width: fit-content;
        }
    }
</style>