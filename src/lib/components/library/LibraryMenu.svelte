<script lang="ts">
    import Icon from "@iconify/svelte"
    import Button from "../ui/Button.svelte"
    import LibraryManager from "$lib/components/library/LibraryManager.svelte"
    import NotificationManager from "$lib/components/notifications/NotificationManager.svelte"

    function addItems() {
        LibraryManager.addItems()
    }
    function fetchItems() {
        LibraryManager.fetchItems()
    }
</script>

<menu class="library-menu">
    <Button onclick={addItems}>
        <Icon icon="material-symbols:note-add"></Icon>
    </Button>
    <Button onclick={fetchItems}>
        <Icon icon="material-symbols:refresh"></Icon>
    </Button>
</menu>

<style lang="scss">
    .library-menu {
        background-color: var(--color-surface);
        color: var(--color-surface-text);

        display: flex;
        width: 100%;
        padding: 8px 16px;

        gap: 8px;
    }
</style>