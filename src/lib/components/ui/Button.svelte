<script lang="ts">
    let { color = "primary", size = 42, children, onclick } = $props()
</script>

<button
    {onclick}
    class="button-container"
    style:background-color="var(--color-{color})"
    style:color="var(--color-{color}-text)"
    style:width="{size}px"
    style:font-size="{size/2}px"
>
    {@render children()}
</button>

<style lang="scss">
    @use "$lib/styles/mixins/interactive";

    .button-container {
        @include interactive.interactable;

        border: none;
        border-radius: 8px;

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        aspect-ratio: 1/1;
    }
</style>