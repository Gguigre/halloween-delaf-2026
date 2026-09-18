import { describe, expect, it } from 'vitest'
import { formatCountdown } from './countdownFormat'

describe('formatCountdown', () => {
  it('affiche les minutes et les secondes', () => {
    expect(formatCountdown(90)).toBe('1:30')
    expect(formatCountdown(150)).toBe('2:30')
    expect(formatCountdown(180)).toBe('3:00')
  })

  it('complète les secondes à deux chiffres', () => {
    expect(formatCountdown(65)).toBe('1:05')
    expect(formatCountdown(9)).toBe('0:09')
  })

  it('arrondit au-dessus : il reste du temps tant que ce n’est pas zéro', () => {
    expect(formatCountdown(0.4)).toBe('0:01')
    expect(formatCountdown(59.9)).toBe('1:00')
  })

  it('ne descend jamais sous zéro', () => {
    expect(formatCountdown(0)).toBe('0:00')
    expect(formatCountdown(-5)).toBe('0:00')
  })
})
