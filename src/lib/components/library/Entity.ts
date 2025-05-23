/**
 * Base Library Item type. 
 */
export interface LibraryItem {
    id: number,
    path: string,
    title: string,
    description?: string,
    thumbnail?: string,
    added: number,
    lastVerified: number,
}

/**
 * Tag grouping category.
 */
export interface TagCategory {
    id: number,
    name: string
}

/**
 * Individual tag.
 */
export interface Tag {
    id: number,
    name: string,
    category: number
}