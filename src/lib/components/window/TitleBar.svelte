<script lang="ts">
    import Icon from "@iconify/svelte"
    import { getCurrentWindow } from '@tauri-apps/api/window'
    import { onDestroy, onMount } from "svelte";

    const appWindow = getCurrentWindow()

    let isMaximized = $state(false)

    let isMaximizedListener = $state<(() => void) | null>(null);

    onMount(async () => {
        try {
            isMaximized = await appWindow.isMaximized();
            
            isMaximizedListener = await appWindow.onResized(async () => {
                isMaximized = await appWindow.isMaximized();
            });
        } catch (error) {
            console.error('Window state error:', error);
        }
    });

    onDestroy(() => {
        isMaximizedListener?.();
    })
</script>


<div data-tauri-drag-region class="container">
    <figure class="logo"></figure>
    
    <menu class="actions">
        <button onclick={appWindow.minimize} class="action-minimize" aria-label="Minimize window">
            <Icon inline icon="material-symbols:horizontal-rule" />
        </button>
        <button onclick={appWindow.toggleMaximize} class="action-maximize" aria-label="Maximize window">
            {#if isMaximized }
                <Icon inline icon="material-symbols:select-window-2-outline-sharp" />
            {:else}
                <Icon inline icon="material-symbols:rectangle-outline" />
            {/if}
        </button>
        <button onclick={appWindow.close} class="action-close" aria-label="Close application">
            <Icon inline icon="material-symbols:close" />
        </button>
    </menu>
</div>


<style lang="scss">
    @use "$lib/styles/mixins/interactive";

    .container {
        background-color: var(--color-pane);
        color: var(--color-pane-text);

        position: relative;

        z-index: 1000;
        height: var(--title-bar-height);
        user-select: none;
        display: flex;
        justify-content: space-between;
        top: 0;
        left: 0;
        right: 0;
    }

    .actions {
        display: flex;

        button {
            @include interactive.interactable;

            font-size: 14px;
            padding: 0px 16px;
            border: none;

            color: var(--color-pane-text);
            background-color: transparent;
            transition: background-color 0.2s;

            &.action-close:hover {
                background-color: var(--color-error);
                color: var(--color-error-text);
            }
        }
    }
</style>