<script lang="ts">
    import type { LayoutProps } from "./$types";

    let { children }: LayoutProps = $props();
</script>

<div id="app-container">
    <main id="content-container">
        {@render children()}
    </main>
</div>

<style lang="scss">
    #app-container {
        display: flex;
        flex-direction: row;
    }

    #content-container {
        border: 0px solid var(--color-outline);
        border-width: 1px 0px 0px 1px;
        box-sizing: border-box;

        height: calc(100vh - 32px);
        width: 100%;
        overflow-y: auto;
        overflow-x: hidden;
    }
</style>