<script lang="ts">
    import "$lib/styles/theme-dark.scss";
    import "$lib/styles/fonts.scss";
    import "$lib/styles/global.scss";

    import TitleBar from "$lib/components/TitleBar.svelte";
    import type { LayoutProps } from "./$types";
    import SideBar from "$lib/components/SideBar.svelte";


    let { children }: LayoutProps = $props();
</script>


<TitleBar></TitleBar>

<div class="container">
    <SideBar></SideBar>

    <main class="content">
        {@render children()}
    </main>
</div>



<style lang="scss">
    @use "$lib/styles/mixins";

    .container {
        display: flex;
        flex-direction: row;
        background-color: var(--color-surface);
    }

    .content {
        border: 1px solid var(--color-border);
        border-top-left-radius: 12px;
        box-sizing: border-box;

        @include mixins.foundation;
        height: calc(100vh - 32px);
        width: 100%;
        overflow-y: auto;
        overflow-x: hidden;
    }
</style>