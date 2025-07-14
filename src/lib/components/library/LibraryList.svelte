<script lang="ts">
    let { items } = $props();
    import LibraryManager from "$lib/components/library/LibraryManager.svelte"
    import type { Attachment } from "svelte/attachments";
    import LibraryItem from "./LibraryItem.svelte";

    const loadLibraryItems: Attachment = () => {
        
    }
</script>

<ul class="library-list-container">
    {#each items as item}
        <LibraryItem {item}></LibraryItem>
    {/each}
</ul>