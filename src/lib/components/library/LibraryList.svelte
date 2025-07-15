<script lang="ts">
    let { items } = $props();
    import LibraryManager from "$lib/components/library/LibraryManager.svelte"
    import LibraryItem from "./LibraryItem.svelte";
    import { onMount } from "svelte";

    onMount(() => {
        LibraryManager.loadItems(items)
    })
</script>

<ul class="library-list-container">
    {#each items as id}
        <LibraryItem item={LibraryManager.getItem(id)}></LibraryItem>
    {/each}
</ul>