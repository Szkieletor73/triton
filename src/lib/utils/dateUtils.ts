import { DateTime } from 'luxon'

/**
* Formats a timestamp (in seconds or milliseconds) to a human-readable date string
* @param timestamp - Unix timestamp in seconds or milliseconds
* @param format - Optional format string, defaults to short date.
* @returns Formatted date string
*/
export function formatTimestamp(timestamp: number, format?: 'relative' | 'short' | 'long'): string {
    if (!timestamp || timestamp <= 0) {
        return 'unknown'
    }
    
    // Convert to milliseconds if timestamp appears to be in seconds
    const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp
    const dateTime = DateTime.fromMillis(ms)
    
    if (!dateTime.isValid) {
        return 'invalid date'
    }
    
    switch (format) {
        case 'relative':
            return dateTime.toRelative() || 'unknown'
        case 'long':
            return dateTime.toFormat('MMMM dd, yyyy \'at\' h:mm a')
        case 'short':
        default:
            return dateTime.toFormat('MMM dd, yyyy')
    }
}

/**
* Helper that runs `formatTimestamp` with the `'relative'` format parameter.
* @param timestamp - Unix timestamp
* @returns Formatted string like "2 days ago"
*/
export function formatRelative(timestamp: number): string {
    return formatTimestamp(timestamp, 'relative')
}

/**
* Helper that runs `formatTimestamp` with the `'long'` format parameter.
* @param timestamp - Unix timestamp
* @returns Long formatted date string
*/
export function formatLongDate(timestamp: number): string {
    return formatTimestamp(timestamp, 'long')
}