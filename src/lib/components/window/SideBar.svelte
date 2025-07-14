<script lang="ts">
    import Icon from "@iconify/svelte";
</script>

<aside class="container">
    <nav class="navigation">
        <ul class="list">
            <a href="/">
                <li class="list-item">
                    <div class="list-item-icon">
                        <Icon inline icon="material-symbols:view-list-sharp"></Icon>
                    </div>
                    <div class="list-item-label">Library</div>
                </li>
            </a>
        </ul>
    </nav>

    <menu class="settings">
    </menu>
</aside>

<style lang="scss">
    @use "$lib/styles/mixins/interactive";

    .container {
        background-color: var(--color-pane);
        color: var(--color-pane-text);
        
        height: calc(100vh - 32px);
    }

    .list {
        list-style: none;
        margin: 0;
        margin-top: 12px;
        padding: 0;
        width: 64px;
        overflow: hidden;
    }

    .list-item {
        background-color: var(--color-element);
        color: var(--color-element-text);

        width: 100%;
        min-width: min-content;
        height: 64px;
        @include interactive.interactable;

        display: inline-flex;
        flex-wrap: nowrap;
        flex-direction: row;
        align-items: center;

        font-size: var(--text-md);

        .list-item-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 64px;
            font-size: var(--text-xl);
        }
    }
</style>