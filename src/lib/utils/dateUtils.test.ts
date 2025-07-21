import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DateTime } from 'luxon'
import { 
  formatTimestamp,
  formatRelative,
  formatLongDate
} from './dateUtils'

describe('dateUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatTimestamp', () => {
    it('should handle timestamps in seconds', () => {
      const timestamp = 1705320000 // 2024-01-15T12:00:00Z in seconds
      const result = formatTimestamp(timestamp, 'short')
      expect(result).toBe('Jan 15, 2024')
    })

    it('should handle timestamps in milliseconds', () => {
      const timestamp = 1705320000000 // 2024-01-15T12:00:00Z in milliseconds
      const result = formatTimestamp(timestamp, 'short')
      expect(result).toBe('Jan 15, 2024')
    })

    it('should return short time by default', () => {
      const timestamp = 1705320000000 // 2024-01-15T12:00:00Z in milliseconds
      const result = formatTimestamp(timestamp)
      expect(result).toBe('Jan 15, 2024')
    })

    it('should handle long format', () => {
      const timestamp = 1705320000 // 2024-01-15T12:00:00Z
      const result = formatTimestamp(timestamp, 'long')
      expect(result).toMatch(/January 15, 2024 at \d{1,2}:\d{2} [AP]M/)
    })

    it('should handle invalid timestamps', () => {
      expect(formatTimestamp(0)).toBe('unknown')
      expect(formatTimestamp(-1)).toBe('unknown')
      expect(formatTimestamp(NaN)).toBe('unknown')
    })

    it('should handle invalid dates', () => {
      // eslint-disable-next-line no-loss-of-precision
      const invalidTimestamp = 999999999999999999999
      const result = formatTimestamp(invalidTimestamp)
      expect(result).toBe('invalid date')
    })
  })

  describe('formatRelative', () => {
    it('should format into a relative time format', () => {
      const oneHourAgo = DateTime.now().minus({ hours: 1 }).toSeconds()
      const result = formatRelative(oneHourAgo)
      expect(result).toContain('hour ago')
    })

    it('should handle unknown dates', () => {
      const result = formatRelative(0)
      expect(result).toBe('unknown')
    })
  })

  describe('formatLongDate', () => {
    it('should return long formatted date', () => {
      const timestamp = 1705320000 // 2024-01-15T12:00:00Z
      const result = formatLongDate(timestamp)
      expect(result).toMatch(/January 15, 2024 at \d{1,2}:\d{2} [AP]M/)
    })
  })
})