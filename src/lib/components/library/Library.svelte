<script lang="ts">
    import Menu from "./Menu.svelte";
    import List from "./List.svelte";
</script>

<div class="container">
    <Menu></Menu>

    <List></List>
</div>

<style lang="scss">
    @use "$lib/styles/mixins";

    .container {
        display: flex;
        flex-direction: column;
    }
</style>