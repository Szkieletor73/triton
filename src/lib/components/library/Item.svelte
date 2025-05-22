<script lang="ts">
    import type { LibraryItem } from "$lib/components/library/Entity";
    import LibraryManager from "./LibraryManager.svelte";

    let { id } = $props()

    let item: LibraryItem | null = $derived(LibraryManager.item(id))
</script>

<li class="container">
    ID: {id} | Details: {item || "undefined"}
</li>

<style style="scss">
    .container {

    }
</style>