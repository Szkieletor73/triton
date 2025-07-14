<script lang="ts">
    import "$lib/styles/style.scss"

    import TitleBar from "$lib/components/window/TitleBar.svelte"
    import type { LayoutProps } from "./$types"
    import ModalHost from "$lib/components/modal/ModalHost.svelte";
    import NotificationHost from "$lib/components/notifications/NotificationHost.svelte";

    let { children }: LayoutProps = $props()
</script>

<TitleBar></TitleBar>

{@render children()}

<ModalHost></ModalHost>
<NotificationHost></NotificationHost>