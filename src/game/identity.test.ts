import { describe, expect, it } from 'vitest'
import { isValidName, isValidPin, playerDocId, sanitize } from './identity'

describe('sanitize', () => {
  it('retire accents, casse, espaces et ponctuation', () => {
    expect(sanitize('José ')).toBe('jose')
    expect(sanitize('  Marie-Ange ')).toBe('marieange')
    expect(sanitize('ÉLODIE')).toBe('elodie')
    expect(sanitize("L'été")).toBe('lete')
  })

  it('vide un prénom composé uniquement d’émojis', () => {
    expect(sanitize('👻🎃')).toBe('')
  })
})

describe('playerDocId', () => {
  it('fait pointer les variantes d’un même prénom sur le même document', () => {
    expect(playerDocId('José ', '4271')).toBe('jose-4271')
    expect(playerDocId('jose', '4271')).toBe('jose-4271')
    expect(playerDocId('JOSÉ', '4271')).toBe('jose-4271')
  })

  it('distingue deux joueuses de même prénom avec des codes différents', () => {
    expect(playerDocId('Julie', '1234')).not.toBe(playerDocId('Julie', '4321'))
  })

  it('garde les zéros de tête du code', () => {
    expect(playerDocId('Julie', '0042')).toBe('julie-0042')
  })

  it('refuse un prénom vide après normalisation', () => {
    expect(() => playerDocId('👻', '1234')).toThrow()
  })

  it('refuse un code qui n’est pas quatre chiffres', () => {
    expect(() => playerDocId('Julie', '42')).toThrow()
    expect(() => playerDocId('Julie', 'abcd')).toThrow()
  })
})

describe('validation de saisie', () => {
  it('accepte un prénom raisonnable et refuse les cas limites', () => {
    expect(isValidName('Julie')).toBe(true)
    expect(isValidName('  ')).toBe(false)
    expect(isValidName('👻')).toBe(false)
    expect(isValidName('a'.repeat(21))).toBe(false)
    expect(isValidName('a'.repeat(20))).toBe(true)
  })

  it('n’accepte que des codes à quatre chiffres', () => {
    expect(isValidPin('0000')).toBe(true)
    expect(isValidPin('123')).toBe(false)
    expect(isValidPin('12345')).toBe(false)
    expect(isValidPin('12a4')).toBe(false)
  })
})
