import { untrack } from 'svelte'

/**
 * Watch an element's visibility using IntersectionObserver API.
 * Efficiently tracks when an element enters or leaves the viewport.
 * 
 * @param element - The DOM element to observe
 * @param callback - Function called when visibility changes (receives boolean)
 * @param options - Optional IntersectionObserver options
 * @returns Cleanup function to stop observing
 * 
 * @example
 * ```svelte
 * <script>
 *     let elementRef: HTMLElement
 *     let visible = $state(false)
 *     
 *     $effect(() => {
 *         if (elementRef) {
 *             const cleanup = watchVisibility(elementRef, (isVisible) => {
 *                 visible = isVisible
 *             })
 *             return cleanup
 *         }
 *     })
 * </script>
 * 
 * <div bind:this={elementRef}>
 *     {#if visible}Content is visible!{/if}
 * </div>
 * ```
 */
export function watchVisibility(
    element: Element,
    callback: (isVisible: boolean) => void,
    options: IntersectionObserverInit = {}
): () => void {
    const defaultOptions: IntersectionObserverInit = {
        rootMargin: '50px 0px', // Trigger slightly before entering viewport
        threshold: 0, // Trigger as soon as any part is visible
        ...options
    }

    const observer = new IntersectionObserver(
        (entries) => {
            untrack(() => {
                for (const entry of entries) {
                    if (entry.target === element) {
                        callback(entry.isIntersecting)
                        break
                    }
                }
            })
        },
        defaultOptions
    )

    observer.observe(element)

    // Return cleanup function
    return () => {
        observer.unobserve(element)
        observer.disconnect()
    }
}

/**
 * Create a reactive visibility state for an element.
 * Returns a reactive boolean that updates when element visibility changes.
 * 
 * @param element - The DOM element to observe (can be reactive)
 * @param options - Optional IntersectionObserver options
 * @returns Object with visible state and cleanup function
 * 
 * @example
 * ```svelte
 * <script>
 *     let elementRef: HTMLElement
 *     const visibility = useVisible(elementRef)
 * </script>
 * 
 * <div bind:this={elementRef}>
 *     {#if visibility.visible}
 *         <ExpensiveComponent />
 *     {:else}
 *         <div>Loading...</div>
 *     {/if}
 * </div>
 * ```
 */
export function useVisible(
    element: Element | null,
    options: IntersectionObserverInit = {}
) {
    let visible = $state(false)
    let cleanup: (() => void) | null = null

    $effect(() => {
        // Clean up previous observer
        cleanup?.()
        cleanup = null

        if (element) {
            cleanup = watchVisibility(
                element,
                (isVisible) => {
                    visible = isVisible
                },
                options
            )
        }

        // Cleanup when effect is destroyed
        return () => {
            cleanup?.()
        }
    })

    return {
        get visible() {
            return visible
        },
        destroy() {
            cleanup?.()
        }
    }
}