<script lang="ts">
    let { item } = $props();
    import { convertFileSrc } from "@tauri-apps/api/core";

    let thumbnail = $derived(item.thumbnail ? convertFileSrc(item.thumbnail) : "")
</script>

<li class="library-item">
    {#if item != null}
        <div>
            {item.id}
            <img src={thumbnail} alt="Item thumbnail">
        </div>
    {/if}
</li>