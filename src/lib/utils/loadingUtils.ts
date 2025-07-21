/**
 * Loading state management utilities
 */

/**
 * Shared core utilities for loading state management
 */
const loadingCore = {
  /**
   * Formats any error type into a consistent string message
   */
  formatError: (error: unknown): string => {
    return error instanceof Error ? error.message : String(error)
  },

  /**
   * Creates a timestamp for tracking operation completion
   */
  createTimestamp: (): number => Date.now(),

  /**
   * Creates initial loading state object
   */
  createInitialState: () => ({
    isLoading: false,
    error: null,
    lastUpdated: null
  })
}

/**
 * Loading state interface
 */
export interface LoadingState {
  isLoading: boolean
  error: string | null
  lastUpdated: number | null
}

/**
 * Creates a reactive loading state manager
 * 
 * @example
 * ```svelte
 * <script>
 *   import { createLoadingState } from '$lib/utils/loadingUtils'
 *   
 *   const loader = createLoadingState()
 *   
 *   async function handleSubmit() {
 *     await loader.withLoading(async () => {
 *       const response = await fetch('/api/submit', { method: 'POST' })
 *       return response.json()
 *     })
 *   }
 * </script>
 * 
 * {#if loader.state.isLoading}
 *   <p>Loading...</p>
 * {:else if loader.state.error}
 *   <p class="error">{loader.state.error}</p>
 * {/if}
 * 
 * <button onclick={handleSubmit}>Submit</button>
 * ```
 */
export function createLoadingState(): {
  state: LoadingState
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>
} {
  const state = $state<LoadingState>(loadingCore.createInitialState())

  function setLoading(loading: boolean) {
    state.isLoading = loading
    if (loading) {
      state.error = null
    } else {
      state.lastUpdated = loadingCore.createTimestamp()
    }
  }

  function setError(error: string | null) {
    state.error = error
    state.isLoading = false
    state.lastUpdated = loadingCore.createTimestamp()
  }

  function reset() {
    Object.assign(state, loadingCore.createInitialState())
  }

  /**
   * Wraps an async operation with automatic loading state management.
   * Sets loading to true before execution, handles success/error states,
   * and preserves the original return type and any thrown errors.
   * 
   * @param fn - Async function to execute with loading state management
   * @returns Promise that resolves to the same type as the input function
   * @throws Re-throws any error from the input function after updating error state
   * 
   * @example
   * ```typescript
   * const data = await loader.withLoading(() => fetchUserData())
   * // Loading state is automatically managed, errors update UI state
   * ```
   */
  async function withLoading<T>(fn: () => Promise<T>): Promise<T> {
    setLoading(true)
    try {
      const result = await fn()
      setLoading(false)
      return result
    } catch (error) {
      setError(loadingCore.formatError(error))
      throw error
    }
  }

  return {
    state,
    setLoading,
    setError,
    reset,
    withLoading
  }
}

/**
 * Loading state for individual items (like library items)
 */
export interface ItemLoadingState {
  [key: string]: LoadingState
}

/**
 * Creates a manager for tracking loading states of multiple items
 * 
 * @example
 * ```svelte
 * <script>
 *   import { createItemLoadingManager } from '$lib/utils/loadingUtils'
 *   
 *   const itemLoader = createItemLoadingManager()
 *   let items = [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }]
 *   
 *   async function deleteItem(id) {
 *     await itemLoader.withItemLoading(id, async () => {
 *       await fetch(`/api/items/${id}`, { method: 'DELETE' })
 *       items = items.filter(item => item.id !== id)
 *     })
 *   }
 * </script>
 * 
 * {#each items as item}
 *   <div class="item">
 *     <span>{item.name}</span>
 *     {#if itemLoader.getItemState(item.id).isLoading}
 *       <span>Deleting...</span>
 *     {:else if itemLoader.getItemState(item.id).error}
 *       <span class="error">{itemLoader.getItemState(item.id).error}</span>
 *     {:else}
 *       <button onclick={() => deleteItem(item.id)}>Delete</button>
 *     {/if}
 *   </div>
 * {/each}
 * ```
 */
export function createItemLoadingManager() {
  let states = $state<ItemLoadingState>({})

  /**
   * Ensures an item state exists and returns it
   */
  function ensureItemState(id: string) {
    if (!states[id]) {
      states[id] = loadingCore.createInitialState()
    }
    return states[id]
  }

  function setItemLoading(id: string, loading: boolean) {
    const itemState = ensureItemState(id)
    itemState.isLoading = loading
    if (loading) {
      itemState.error = null
      itemState.lastUpdated = loadingCore.createTimestamp()
    }
  }

  function setItemError(id: string, error: string | null) {
    const itemState = ensureItemState(id)
    itemState.error = error
    itemState.isLoading = false
    itemState.lastUpdated = loadingCore.createTimestamp()
  }

  function getItemState(id: string) {
    return states[id] || loadingCore.createInitialState()
  }

  function clearItemState(id: string) {
    delete states[id]
  }

  function clearAllStates() {
    states = {}
  }

  /**
   * Wraps an async operation with automatic loading state management for a specific item.
   * 
   * @param id - Unique identifier for the item
   * @param fn - Async function to execute with loading state management
   * @returns Promise that resolves to the same type as the input function
   * @throws Re-throws any error from the input function after updating error state
   */
  async function withItemLoading<T>(id: string, fn: () => Promise<T>): Promise<T> {
    setItemLoading(id, true)
    try {
      const result = await fn()
      setItemLoading(id, false)
      return result
    } catch (error) {
      setItemError(id, loadingCore.formatError(error))
      throw error
    }
  }

  return {
    states,
    setItemLoading,
    setItemError,
    getItemState,
    clearItemState,
    clearAllStates,
    withItemLoading
  }
}

/**
 * Debounced loading state to prevent rapid state changes
 * 
 * @param delay - Milliseconds to delay hiding the loading state (default: 300)
 * 
 * @example
 * ```svelte
 * <script>
 *   import { createDebouncedLoadingState } from '$lib/utils/loadingUtils'
 *   
 *   const searchLoader = createDebouncedLoadingState(500)
 *   let searchQuery = ''
 *   let results = []
 *   
 *   async function handleSearch() {
 *     if (!searchQuery.trim()) return
 *     
 *     results = await searchLoader.withLoading(async () => {
 *       const response = await fetch(`/api/search?q=${searchQuery}`)
 *       return response.json()
 *     })
 *   }
 * </script>
 * 
 * <input bind:value={searchQuery} oninput={handleSearch} placeholder="Search..." />
 * 
 * {#if searchLoader.state.isLoading}
 *   <div class="spinner">Searching...</div>
 * {/if}
 * 
 * {#each results as result}
 *   <div>{result.title}</div>
 * {/each}
 * ```
 */
export function createDebouncedLoadingState(delay: number = 300) {
  const baseState = createLoadingState()
  let timeoutId: number | null = null

  function setLoading(loading: boolean) {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    if (loading) {
      // Show loading immediately
      baseState.setLoading(true)
    } else {
      // Debounce hiding loading state
      timeoutId = window.setTimeout(() => {
        baseState.setLoading(false)
        timeoutId = null
      }, delay)
    }
  }

  return {
    ...baseState,
    setLoading
  }
}