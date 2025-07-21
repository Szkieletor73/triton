import type { LibraryItem } from "$lib/components/library/Entity"
import { invoke } from "@tauri-apps/api/core"
import { SvelteMap } from "svelte/reactivity"

export interface AddItemsResult {
    success: number[];
    duplicates: string[];
    errors: { path: string; error: string }[];
}

class LibraryManager {
    static #instance: LibraryManager

    static get instance(): LibraryManager {
        if (!LibraryManager.#instance) {
            LibraryManager.#instance = new LibraryManager()
        }
        return LibraryManager.#instance
    }

    /**
     * There are three possible values for `#items.get()`:  
     * `typeof LibraryItem` - a loaded item object.  
     * `null` - item exists, but isn't loaded  
     * `undefined` - item with that ID doesn't exist.
     * As items should usually only be accessed using keys of #items,
     * `undefined` being returned should be considered an error.
     */
    #items: SvelteMap<number, LibraryItem | null> = new SvelteMap()
    
    // Batching system for loading items
    #pendingLoads: Set<number> = new Set()
    #loadTimeout: ReturnType<typeof setTimeout> | null = null
    #batchSize = 50 // Load items in batches of 50
    #batchDelay = 10 // Wait 10ms to collect more items before loading

    constructor() { }

    getIds(): number[] {
        return Array.from(this.#items.keys())
    }

    getItem(id: number): LibraryItem | null | undefined {
        return this.#items.get(id)
    }

    getLoadedCount(): number {
        return Array.from(this.#items.values()).reduce((total, item) => item === null ? total : total + 1, 0)
    }

    async fetchItems(): Promise<void> {
        try {
            const items = await invoke("get_items", {
                search: ""
            });

            if (Array.isArray(items)) {
                items.forEach((item: number) => {
                    this.#items.set(item, null);
                });
            } else {
                console.error("[LibraryManager] get_items did not return an array:", items);
            }
        } catch (error) {
            console.error("[LibraryManager] Error fetching items:", error);
        }
    }

    async loadItem(id: number): Promise<void> {
        // Don't load if already loaded or already pending
        const currentItem = this.#items.get(id)
        if (currentItem !== null && currentItem !== undefined) {
            return
        }
        
        if (this.#pendingLoads.has(id)) {
            return
        }

        // Add to pending loads
        this.#pendingLoads.add(id)

        // Clear existing timeout and set a new one
        if (this.#loadTimeout !== null) {
            clearTimeout(this.#loadTimeout)
        }

        this.#loadTimeout = setTimeout(() => {
            this.#processBatchedLoads()
        }, this.#batchDelay)
    }

    async #processBatchedLoads(): Promise<void> {
        if (this.#pendingLoads.size === 0) {
            return
        }

        // Convert pending loads to array and clear the set
        const idsToLoad = Array.from(this.#pendingLoads)
        this.#pendingLoads.clear()
        this.#loadTimeout = null

        // Filter out items that are already loaded (race condition protection)
        const filteredIds = idsToLoad.filter(id => {
            const item = this.#items.get(id)
            return item === null || item === undefined
        })

        if (filteredIds.length === 0) {
            return
        }

        // Process in batches to avoid overwhelming the database
        for (let i = 0; i < filteredIds.length; i += this.#batchSize) {
            const batch = filteredIds.slice(i, i + this.#batchSize)
            await this.#loadItemBatch(batch)
        }
    }

    async #loadItemBatch(ids: number[]): Promise<void> {
        try {
            const items = await invoke("get_item_details", {
                ids: ids
            });

            if (Array.isArray(items)) {
                items.forEach((item: LibraryItem) => {
                    this.#items.set(item.id, item)
                })
            } else {
                console.error("[LibraryManager] get_item_details did not return an array:", items);
            }
        } catch (error) {
            console.error("[LibraryManager] Error loading item batch:", error);
        }
    }

    unloadItem(id: number): void {
        const currentItem = this.#items.get(id)
        if (currentItem !== null && currentItem !== undefined) {
            this.#items.set(id, null)
        }
    }

    async addItems(): Promise<AddItemsResult> {
        try {
            const result = await invoke("add_items", {});

            // Parse the result from the backend into our structured format
            if (result && typeof result === 'object') {
                const addResult: AddItemsResult = {
                    success: (result as any).success || [],
                    duplicates: (result as any).duplicates || [],
                    errors: (result as any).errors || []
                };

                // Update the items map with newly added items
                if (addResult.success.length > 0) {
                    addResult.success.forEach((itemId: number) => {
                        this.#items.set(itemId, null);
                    });
                }

                return addResult;
            } else {
                // Fallback for unexpected result format
                return {
                    success: [],
                    duplicates: [],
                    errors: [{ path: "unknown", error: "Unexpected response format from backend" }]
                };
            }
        } catch (error) {
            console.error("[LibraryManager] Error adding items:", error);
            return {
                success: [],
                duplicates: [],
                errors: [{ path: "unknown", error: error instanceof Error ? error.message : "Unknown error occurred" }]
            };
        }
    }
}

export default LibraryManager.instance