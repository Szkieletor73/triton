import type { LibraryItem } from "$lib/components/library/Entity"
import { invoke } from "@tauri-apps/api/core"
import { SvelteMap } from "svelte/reactivity"

class LibraryManager {
    static #instance: LibraryManager

    static get instance(): LibraryManager {
        if (!LibraryManager.#instance) {
            LibraryManager.#instance = new LibraryManager()
        }
        return LibraryManager.#instance
    }


    /**
     * There are three possible values for `get()`:  
     * `typeof LibraryItem` - a loaded item object.  
     * `null` - item exists, but isn't loaded  
     * `undefined` - item with that ID doesn't exist.
     * As items should usually only be accessed using keys of #items,
     * `undefined` should NOT occur under any circumstance.
     */
    #items: SvelteMap<number, LibraryItem | null> = new SvelteMap()
    offset: number = $state(0)
    pageSize: number = 20

    constructor() {}

    async fetchItems() {
        invoke('get_items', { search: "" }).then(
            (items) => {
                if (Array.isArray(items)) {
                    items.forEach((item: number) => {
                        this.#items.set(item, null)
                    });
                }

                this.fetchItemDetails(this.ids)
            },
            (error) => { console.error(error) }
        )
    }

    async fetchItemDetails(ids: number[]) {
        invoke('get_item_details', { ids }).then(
            (results) => {
                if (Array.isArray(results)) {
                    results.forEach((result: LibraryItem) => {
                        this.#items.set(result.id, result)
                    });
                }
            },
            (error) => { console.error(error) }
        )
    }

    async addItems() {
        invoke('add_items').then(
            (newItems) => {
                if (Array.isArray(newItems)) {
                    newItems.forEach(item => {
                        this.#items.set(item, null)
                    });
                }
            }
        )
    }

    async deleteItems(ids: number[]) {
        invoke('delete_items', { ids }).then(
            (deletedItems) => {
                if (Array.isArray(deletedItems)) {
                    deletedItems.forEach(item => {
                        this.#items.delete(item)
                    })
                }
            }
        )
    }

    get ids() {
        return this.#items.keys().toArray()
    }

    get items() {
        return this.#items.values().toArray()
    }

    /**
     * Function accessor to #items Map.
     * @param id of the item
     * @returns `LibraryItem` if it exists and is loaded, `null` if the item is not loaded.
     */
    item(id: number): LibraryItem | null {
        const item = this.#items.get(id)
        if (item === undefined) {
            throw new Error(`[LibraryManager] Attempted to get nonexistent item: id ${id}`);
        }
        return item
    }
}

export default LibraryManager.instance