<script lang="ts">
    import NotificationManager from "$lib/components/notifications/NotificationManager.svelte"
    import NotificationInstance from "./NotificationInstance.svelte";

    const notifications = $derived(NotificationManager.notifications)
</script>

<div class="notification-container">
    {#each notifications as notification (notification.id)}
        <NotificationInstance
            id={notification.id}
            type={notification.type}
            duration={notification.duration}>
            {notification.message}
        </NotificationInstance>
    {/each}
</div>

<style lang="scss">
    .notification-container {
        position: fixed;
        bottom: 8px;
        right: 8px;

        max-width: 300px;

        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 16px;
    }
</style>