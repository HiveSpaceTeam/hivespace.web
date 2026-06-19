import { describe, expect, it } from '@jest/globals'
import { formatDate, formatDateTime, formatRelativeTime, useFormatDate } from './useFormatDate'

describe('formatDate', () => {
  it('should return a formatted date for a valid ISO string', () => {
    const result = formatDate('2026-06-15T00:00:00Z', 'DD/MM/YYYY', {
      locale: 'vi-VN',
      timeZone: 'Asia/Ho_Chi_Minh',
    })
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })

  it('should return fallback for null value', () => {
    expect(formatDate(null)).toBe('-')
  })

  it('should return fallback for undefined value', () => {
    expect(formatDate(undefined)).toBe('-')
  })

  it('should return fallback for an invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('-')
  })
})

describe('formatDateTime', () => {
  it('should return date and time for a valid ISO string', () => {
    const result = formatDateTime('2026-06-15T08:30:00Z', 'DD/MM/YYYY HH:mm', {
      locale: 'vi-VN',
      timeZone: 'UTC',
    })
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/)
  })

  it('should return fallback for null value', () => {
    expect(formatDateTime(null)).toBe('-')
  })
})

describe('formatRelativeTime', () => {
  it('should return fallback for null value', () => {
    expect(formatRelativeTime(null)).toBe('-')
  })

  it('should return just now for a very recent timestamp', () => {
    const justNow = new Date(Date.now() - 30000).toISOString() // 30 seconds ago
    const result = formatRelativeTime(justNow)
    expect(result).toBe('just now')
  })

  it('should return minutes ago for thirty minutes ago', () => {
    const pastDate = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    const result = formatRelativeTime(pastDate)
    expect(result).toContain('minute')
  })

  it('should return a formatted date for two days ago', () => {
    const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    const result = formatRelativeTime(pastDate)
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })
})

describe('formatRelativeTime (hours branch)', () => {
  it('should return hours ago for two hours ago', () => {
    const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    const result = formatRelativeTime(pastDate)
    expect(result).toContain('hour')
  })

  it('should return hours ago for twenty hours ago', () => {
    const pastDate = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
    const result = formatRelativeTime(pastDate)
    expect(result).toContain('hour')
  })
})

describe('useFormatDate', () => {
  it('should return all format functions', () => {
    const { formatDate, formatDateTime, formatRelativeTime, formatNow } = useFormatDate()
    expect(typeof formatDate).toBe('function')
    expect(typeof formatDateTime).toBe('function')
    expect(typeof formatRelativeTime).toBe('function')
    expect(typeof formatNow).toBe('function')
  })

  it('should return current date string from formatNow', () => {
    const { formatNow } = useFormatDate()
    const result = formatNow('DD/MM/YYYY', { locale: 'vi-VN', timeZone: 'UTC' })
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })
})
