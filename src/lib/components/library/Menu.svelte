<script lang="ts">
    import AddItems from "./actions/AddItems.svelte";
    import Refresh from "./actions/Refresh.svelte";

</script>

<menu class="menu">
    <AddItems></AddItems>
    <Refresh></Refresh>
</menu>

<style lang="scss">
    @use "$lib/styles/mixins";

    .menu {
        @include mixins.surface;
        height: 48px;
        width: 100%;
        padding: 4px 16px;

        position: sticky;
        display: flex;
        align-items: center;
        gap: 8px;
    }
</style>