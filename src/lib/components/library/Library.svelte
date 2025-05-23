<script lang="ts">
    import Menu from "./Menu.svelte"
    import List from "./List.svelte"
    import LibraryManager from "./LibraryManager.svelte";

    LibraryManager.fetchItems()
</script>

<div class="library-container">
    <Menu></Menu>
    <List></List>
</div>

<style lang="scss">
    @use "$lib/styles/mixins/generic";

    .library-container {
        height: 100%;

        display: grid;
        grid-template-rows: max-content auto;
    }
</style>