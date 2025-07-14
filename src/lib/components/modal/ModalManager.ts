import type { Component } from "svelte"

export interface ModalInstance {
    id: number,
    component: Component<any>,
    props: Record<string, any>
}

class ModalManager {
    static #instance: ModalManager
    static #nextId = 0

    static get instance(): ModalManager {
        if (!ModalManager.#instance) {
            ModalManager.#instance = new ModalManager()
        }
        return ModalManager.#instance
    }

    #modals: ModalInstance[] = []

    constructor() {}

    get modals(): ModalInstance[] {
        return this.#modals
    }

    open<Props extends Record<string, any>>
    (component: Component<Props>, props: Props) {
        this.#modals.push({
            id: ModalManager.#nextId++,
            component,
            props
        })
    }

    close(id: number) {
        const idx = this.#modals.findIndex(n => n.id === id);
        if (idx !== -1) {
            this.#modals.splice(idx, 1);
        }
    }
}

export default ModalManager.instance