import { describe, it, expect } from 'vitest'
import { formatCoordinates } from '../../../utils/formatCoordinates'

/**
 * Test for formatCoordinates utility function
 * This is a pure function that formats coordinates to 6 decimal places
 * Used in MarkersList component to display marker coordinates
 */
describe('formatCoordinates utility', () => {

  it('formats coordinates with 6 decimal places', () => {
    const result = formatCoordinates(55.755826, 37.617299)
    expect(result).toBe('55.755826, 37.617299')
  })

  it('formats coordinates with correct precision when given more decimals', () => {
    const result = formatCoordinates(55.7558263456789, 37.6172994567890)
    expect(result).toBe('55.755826, 37.617299')
  })

  it('formats coordinates with correct precision when given less decimals', () => {
    const result = formatCoordinates(55.75, 37.61)
    expect(result).toBe('55.750000, 37.610000')
  })

  it('formats negative coordinates correctly', () => {
    const result = formatCoordinates(-55.755826, -37.617299)
    expect(result).toBe('-55.755826, -37.617299')
  })

  it('formats zero coordinates correctly', () => {
    const result = formatCoordinates(0, 0)
    expect(result).toBe('0.000000, 0.000000')
  })

  it('formats integer coordinates correctly', () => {
    const result = formatCoordinates(55, 37)
    expect(result).toBe('55.000000, 37.000000')
  })

  it('handles very large coordinates', () => {
    const result = formatCoordinates(180.0, 90.0)
    expect(result).toBe('180.000000, 90.000000')
  })

  it('handles very small decimal coordinates', () => {
    const result = formatCoordinates(0.000001, 0.000001)
    expect(result).toBe('0.000001, 0.000001')
  })

  it('rounds coordinates correctly when 7th decimal is >= 5', () => {
    const result = formatCoordinates(55.7558267, 37.6172995)
    expect(result).toBe('55.755827, 37.617300')
  })

  it('rounds coordinates correctly when 7th decimal is < 5', () => {
    const result = formatCoordinates(55.7558264, 37.6172994)
    expect(result).toBe('55.755826, 37.617299')
  })
})
