<script lang="ts">
    let { color = "primary", size = 42, children, onclick } = $props()
</script>

<button
    {onclick}
    class="button-container"
    style:width="{size}px"
    style:font-size="{size/2}px"
    style:--button-color="var(--color-{color})"
    style:--button-color-text="var(--color-{color}-text)"
    style:--button-color-hover="var(--color-{color}-lighter)"
    style:--button-color-active="var(--color-{color}-darker)"
>
    {@render children()}
</button>

<style lang="scss">
    .button-container {
        position: relative;

        border: none;
        border-radius: 8px;

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        aspect-ratio: 1/1;
        transition: background-color 0.2s ease;

        background-color: var(--button-color);
        color: var(--button-color-text);

        &:hover {
            background-color: var(--button-color-hover);
        }

        &:active {
            background-color: var(--button-color-active);
        }
    }
</style>