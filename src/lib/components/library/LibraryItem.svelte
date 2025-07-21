<script lang="ts">
    let { itemId } = $props();
    import { convertFileSrc } from "@tauri-apps/api/core";
    import { formatTimestamp, formatRelative } from "$lib/utils";
    import Icon from "@iconify/svelte";
    import LibraryManager from "$lib/components/library/LibraryManager.svelte";
    import { onMount, onDestroy } from "svelte";

    let itemElement: HTMLLIElement
    let observer: IntersectionObserver | null = null
    let isVisible = $state(false)

    let item = $derived(LibraryManager.getItem(itemId))

    let thumbnail = $derived(
        item?.thumbnail ? convertFileSrc(item.thumbnail) : "",
    );
    let imageError = $state(false);

    function handleImageError() {
        imageError = true;
    }

    $effect(() => {
        if (isVisible && item === null) {
            LibraryManager.loadItem(itemId)
        }
    })

    onMount(() => {
        // Create intersection observer
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const wasVisible = isVisible
                    isVisible = entry.isIntersecting

                    if (isVisible && !wasVisible) {
                        LibraryManager.loadItem(itemId)
                    } else if (!isVisible && wasVisible && item !== null && item !== undefined) {
                        LibraryManager.unloadItem(itemId)
                    }
                })
            },
            {
                rootMargin: '50px',
                threshold: 0
            }
        )

        // Start observing the element
        if (itemElement) {
            observer.observe(itemElement)
        }
    })

    onDestroy(() => {
        if (observer && itemElement) {
            observer.unobserve(itemElement)
        }
        observer?.disconnect()
    })
</script>

<li class="library-item" bind:this={itemElement}>
    {#if item != null}
        <div class="item-card">
            <div class="thumbnail-container">
                {#if thumbnail && !imageError}
                    <img
                        src={thumbnail}
                        alt={item.title || "Item thumbnail"}
                        onerror={handleImageError}
                        class="thumbnail"
                    />
                {:else}
                    <div class="thumbnail-fallback">
                        <Icon icon="material-symbols:image" font-size="48px"></Icon>
                    </div>
                {/if}
            </div>

            <div class="content">
                <h3 class="title">{item.title}</h3>

                {#if item.description}
                    <p class="description">{item.description}</p>
                {/if}

                <div class="metadata">
                    <div class="path" title={item.path}>
                        <Icon icon="material-symbols:folder"></Icon>
                        <span class="path-text">{item.path}</span>
                    </div>

                    <div class="dates">
                        <div class="date-item" title={`Added: ${formatTimestamp(item.added)}`}>
                            <Icon icon="material-symbols:calendar-clock"></Icon>
                            <span>Added {formatRelative(item.added)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {:else if item === null}
        <div class="item-card loading">
            <div class="thumbnail-container">
                <div class="thumbnail-skeleton"></div>
            </div>
            <div class="content">
                <div class="title-skeleton"></div>
                <div class="description-skeleton"></div>
                <div class="metadata-skeleton"></div>
            </div>
        </div>
    {/if}
</li>

<style lang="scss">
    .library-item {
        height: 160px;
    }

    .item-card {
        display: flex;
        gap: 1rem;
        align-items: flex-start;

        height: 100%;
        width: 100%;

        background: var(--color-surface);
        color: var(--color-surface-text);

        border: 1px solid var(--color-outline);
        border-radius: 8px;
        padding: 1rem;

        transition: all 0.2s ease;
        cursor: pointer;

        &:hover {
            background: var(--color-element);
        }

        &.loading {
            cursor: default;

            &:hover {
                background: var(--color-surface);
            }
        }
    }

    .thumbnail-container {
        flex-shrink: 0;
        height: 100%;
        aspect-ratio: 16/9;

        overflow: hidden;
        background: var(--color-pane);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .thumbnail {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .thumbnail-fallback {
        color: var(--color-outline);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .thumbnail-skeleton {
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            var(--color-element) 25%,
            var(--color-outline) 50%,
            var(--color-element) 75%
        );
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
    }

    .content {
        flex: 1;
        min-width: 0;
    }

    .title {
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--color-surface-text);
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .description {
        margin: 0 0 0.75rem 0;
        color: var(--color-surface-text);
        font-size: 0.9rem;
        line-height: 1.4;
        line-clamp: 2;
        overflow: hidden;
    }

    .metadata {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .path {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-surface-text);
        font-size: 0.8rem;
        min-width: 0;

        opacity: 0.8;
    }

    .path-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .dates {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .date-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: var(--color-surface-text);
        font-size: 0.75rem;
        opacity: 0.4;
    }

    // Loading state skeletons
    .title-skeleton {
        height: 1.3rem;
        background: linear-gradient(
            90deg,
            var(--color-element) 25%,
            var(--color-outline) 50%,
            var(--color-element) 75%
        );
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 4px;
        margin-bottom: 0.5rem;
        width: 70%;
    }

    .description-skeleton {
        height: 2.5rem;
        background: linear-gradient(
            90deg,
            var(--color-element) 25%,
            var(--color-outline) 50%,
            var(--color-element) 75%
        );
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 4px;
        margin-bottom: 0.75rem;
        width: 90%;
    }

    .metadata-skeleton {
        height: 2rem;
        background: linear-gradient(
            90deg,
            var(--color-element) 25%,
            var(--color-outline) 50%,
            var(--color-element) 75%
        );
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 4px;
        width: 60%;
    }

    @keyframes skeleton-loading {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }
</style>
