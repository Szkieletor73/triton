export interface NotificationInstance {
    id: number;
    type: "success" | "error" | "info" | "warning",
    message: string,
    duration?: number
}

class NotificationManager {
    static #instance: NotificationManager
    static #nextId = 0

    static get instance(): NotificationManager {
        if (!NotificationManager.#instance) {
            NotificationManager.#instance = new NotificationManager()
        }
        return NotificationManager.#instance
    }

    #notifications: NotificationInstance[] = $state([])

    constructor() {}

    get notifications(): NotificationInstance[] {
        return this.#notifications
    }

    spawn(
        type: "success" | "error" | "info" | "warning",
        message: string,
        duration: number = 5000
    ) {
        this.#notifications.push({
            id: NotificationManager.#nextId++,
            type,
            message,
            duration
        })
    }

    close(id: number) {
        const idx = this.#notifications.findIndex(n => n.id === id);
        if (idx !== -1) {
            this.#notifications.splice(idx, 1);
        }
    }
}

export default NotificationManager.instance