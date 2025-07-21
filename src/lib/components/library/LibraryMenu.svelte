<script lang="ts">
    import Icon from "@iconify/svelte"
    import Button from "$lib/components/ui/Button.svelte"
    import LibraryManager from "$lib/components/library/LibraryManager.svelte"
    import NotificationManager from "$lib/components/notifications/NotificationManager.svelte"

    async function addItems() {
        try {
            const result = await LibraryManager.addItems()
            
            // Handle success notifications
            if (result.success.length > 0) {
                NotificationManager.spawn(
                    "success",
                    `Successfully added ${result.success.length} item${result.success.length === 1 ? '' : 's'} to the library`
                )
                
                await LibraryManager.fetchItems()
            }
            
            // Handle duplicate notifications
            if (result.duplicates.length > 0) {
                const duplicateMessage = result.duplicates.length === 1 
                    ? `1 duplicate item was not added: ${result.duplicates[0]}`
                    : `${result.duplicates.length} duplicate items were not added`
                
                NotificationManager.spawn(
                    "warning",
                    duplicateMessage,
                    7000
                )
            }
            
            if (result.errors.length > 0) {
                result.errors.forEach(error => {
                    NotificationManager.spawn(
                        "error",
                        `Failed to add item: ${error.error}`,
                        10000
                    )
                })
            }
            
            if (result.success.length === 0 && result.duplicates.length === 0 && result.errors.length === 0) {
                NotificationManager.spawn(
                    "info",
                    "No items were selected or found to add"
                )
            }
            
        } catch (error) {
            NotificationManager.spawn(
                "error",
                `Unexpected error during add operation: ${error instanceof Error ? error.message : 'Unknown error'}`,
                10000
            )
        }
    }
    
    async function fetchItems() {
        try {
            await LibraryManager.fetchItems()
        } catch (error) {
            NotificationManager.spawn(
                "error",
                `Failed to refresh library: ${error instanceof Error ? error.message : 'Unknown error'}`,
                10000
            )
        }
    }

    const loadedCount = $derived(LibraryManager.getLoadedCount())
</script>

<menu class="library-menu">
    <Button onclick={addItems}>
        <Icon icon="material-symbols:note-add"></Icon>
    </Button>
    <Button onclick={fetchItems}>
        <Icon icon="material-symbols:refresh"></Icon>
    </Button>
    Loaded items: {loadedCount}
</menu>

<style lang="scss">
    .library-menu {
        position: sticky;
        top: 0;

        z-index: 10;

        background-color: var(--color-surface);
        color: var(--color-surface-text);

        display: flex;
        width: 100%;
        padding: 8px 16px;

        gap: 8px;
    }
</style>