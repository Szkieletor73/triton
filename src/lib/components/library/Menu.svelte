<script lang="ts">
    import Icon from "@iconify/svelte";
    import LibraryManager from "./LibraryManager.svelte";

    function addItems() {
        LibraryManager.addItems()
    }
    function fetchItems() {
        LibraryManager.fetchItems()
    }
</script>

<menu class="menu">
    <button onclick={addItems} class="action action-add">
        <Icon icon="material-symbols:note-add"></Icon>
    </button>
    <button onclick={fetchItems} class="action action-refresh">
        <Icon icon="material-symbols:refresh"></Icon>
    </button>
</menu>

<style lang="scss">
    @use "$lib/styles/mixins/generic";
    @use "$lib/styles/mixins/buttons";

    .menu {
        @include generic.surface;

        height: 48px;
        width: 100%;
        padding: 4px 16px;

        display: flex;
        align-items: center;
        gap: 8px;
    }

    button.action {
        @include buttons.square(40);

        &.action-add {
            @include generic.color(success);
        }
        &.action-refresh {
            @include generic.color(primary);
        }
    }
</style>