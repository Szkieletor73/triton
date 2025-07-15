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
     * There are three possible values for `#items.get()`:  
     * `typeof LibraryItem` - a loaded item object.  
     * `null` - item exists, but isn't loaded  
     * `undefined` - item with that ID doesn't exist.
     * As items should usually only be accessed using keys of #items,
     * `undefined` being returned should be considered an error.
     */
    #items: SvelteMap<number, LibraryItem | null> = new SvelteMap()

    constructor() {}

    getItems(): number[] {
        return Array.from(this.#items.keys())
    }

    getItem(id: number): LibraryItem | null | undefined {
        return this.#items.get(id)
    }

    fetchItems() {
        invoke("get_items", {
            search: ""
        }).then((items) => {
            if (Array.isArray(items)) {
                items.forEach((item: number) => {
                    this.#items.set(item, null)
                })
            } else {
                console.error("[LibraryManager] get_items did not return an array:", items)
            }
        })
    }

    loadItems(ids: number[]) {
        invoke("get_item_details", {
            ids: ids
        }).then((items) => {
            if (Array.isArray(items)) {
                items.forEach((item: LibraryItem) => {
                    this.#items.set(item.id, item)
                })
            } else {
                console.error("[LibraryManager] get_item_details did not return an array:", items)
            }
        })
    }

    addItems() {
        invoke("add_items", {}).then((result) => {
            console.log(result)
        })
    }
}

export default LibraryManager.instance