<script lang="ts">
    import NotificationManager from "$lib/components/notifications/NotificationManager.svelte"
    import { onMount } from "svelte";

    const { id, type, duration, children } = $props()

    onMount(() => {
        const timer = setTimeout(() => {
            NotificationManager.close(id)
        }, duration);

        return () => clearTimeout(timer)
    })

</script>

<div class={[ "notification", type ]}>
    <div class="notification-message">
        {@render children()}
    </div>

    <div class="notification-close"
        role="dialog"
        tabindex=0
        onclick={() => NotificationManager.close(id)}
        onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                NotificationManager.close(id)
            }
        }}
        >
        &times;
    </div>
</div>

<style lang="scss">

    .notification {
        background-color: var(--color-surface);
        color: var(--color-surface-text);

        padding: 12px 24px;
        border-radius: 12px;

        display: flex;
        flex-direction: row;
        gap: 4px;

        &.success {
            background-color: var(--color-success);
            color: var(--color-success-text);
        }

        &.error {
            background-color: var(--color-error);
            color: var(--color-error-text);
        }
        &.info {
            background-color: var(--color-info);
            color: var(--color-info-text);
        }

        &.warning {
            background-color: var(--color-warning);
            color: var(--color-warning-text);
        }
    }

    .notification-close {
        cursor: pointer;
    }
</style>