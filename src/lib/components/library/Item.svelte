<script lang="ts">
    import { DateTime } from "luxon"
    import Icon from "@iconify/svelte"

    import type { LibraryItem } from "$lib/components/library/Entity"
    import LibraryManager from "./LibraryManager.svelte"

    let { id, layout = 'list' } = $props()

    let item: LibraryItem | null = $derived(LibraryManager.item(id))

    function editItem() {

    }

    function deleteItem() {
        LibraryManager.deleteItems([id])
    }
</script>

<li class="item {layout}">
    {#if item}
        <div class="thumbnail">

        </div>

        <div class="top">
            <div class="title">{item.title}</div>
            <div class="meta">
                <div class="path">
                    {item.path}
                </div>
                <div class="info">
                    <div class="date-added">
                        <Icon inline icon="material-symbols:calendar-add-on"></Icon>
                        {DateTime.fromSeconds(item.added).toISODate()}
                    </div>
                </div>
            </div>
        </div>

        <div class="bottom">
            <button onclick={editItem} class="action action-edit">
                <Icon icon="material-symbols:edit"></Icon>
            </button>
            <button onclick={deleteItem} class="action action-delete">
                <Icon icon="material-symbols:delete"></Icon>
            </button>
        </div>
    {/if}
</li>

<style lang="scss">
    @use "$lib/styles/mixins/generic";
    @use "$lib/styles/mixins/buttons";

    .item {
        @include generic.surface();

        height: 128px;

        display: grid;
        grid-template-columns: min-content auto;
        grid-template-rows: auto auto;
        grid-template-areas:
            "thumbs top"
            "thumbs bottom";
        justify-items: stretch;
        align-items: start;
        gap: 8px;

        border-radius: 4px;

        overflow: hidden;
    }

    .thumbnail {
        grid-area: thumbs;

        aspect-ratio: 16 / 9;
        height: 100%;

        background: #000;
    }

    .top {
        grid-area: top;

        .title {
            font-size: var(--text-md);
        }
        .meta {
            font-size: var(--text-xs);
            color: var(--color-text-subtle);
        }
    }

    .bottom {
        grid-area: bottom;
        height: 100%;

        display: flex;
        flex-direction: row;
        gap: 4px;
        justify-content: flex-end;
        align-items: flex-end;
    }

    button.action {
        @include buttons.square(32);

        &.action-edit {
            @include generic.color(primary);
        }
        &.action-delete {
            @include generic.color(error);
        }
    }
</style>