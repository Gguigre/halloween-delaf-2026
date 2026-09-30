import { describe, expect, it } from 'vitest'
import { bestState, isWinningGuess, pickWord, scoreGuess } from './logic'

const mots = ['MOMIE', 'MAGIE', 'TOMBE', 'OMBRE', 'CRANE', 'HIBOU', 'BALAI', 'TOILE']

const joueurs = [
  'julie-4271',
  'jose-1987',
  'ines-7777',
  'marek-1234',
  'zoe-0042',
  'hugo-2222',
  'lea-1111',
  'emma-5555',
  'theo-8888',
  'nour-4444',
]

describe('choix du mot', () => {
  it('est déterministe pour un même joueur et un même fantôme', () => {
    expect(pickWord(mots, 'julie-4271', 0)).toBe(pickWord(mots, 'julie-4271', 0))
  })

  it('donne des mots différents à des joueurs différents', () => {
    const tires = new Set(joueurs.map((joueur) => pickWord(mots, joueur, 0)))
    expect(tires.size).toBeGreaterThan(1)
  })

  it('reste dans la réserve de mots', () => {
    expect(mots).toContain(pickWord(mots, 'julie-4271', 0))
  })

  it('ne casse pas sur une réserve vide', () => {
    expect(pickWord([], 'julie-4271', 0)).toBe('')
  })

  it('ne redonne jamais le même mot à un joueur sur deux fantômes différents', () => {
    // Le piège du tirage précédent : le taux de répétition dépendait de la paire
    // d'identifiants, pas du joueur, et pouvait toucher 80 % du service d'un coup.
    for (const joueur of joueurs) {
      const recus = mots.map((_, rang) => pickWord(mots, joueur, rang))
      expect(new Set(recus).size, `répétition pour ${joueur}`).toBe(mots.length)
    }
  })
})

describe('coloration', () => {
  it('marque les lettres bien placées', () => {
    expect(scoreGuess('MOMIE', 'MOMIE')).toEqual([
      'correct',
      'correct',
      'correct',
      'correct',
      'correct',
    ])
  })

  it('distingue présente et absente', () => {
    // TOMBE vs OMBRE : T absent, O présent, M présent, B présent, E bien placé.
    expect(scoreGuess('TOMBE', 'OMBRE')).toEqual([
      'absent',
      'present',
      'present',
      'present',
      'correct',
    ])
  })

  it('ne compte une lettre répétée que le nombre de fois où elle existe', () => {
    // Le cas d'école : deux M dans la tentative, un seul dans la cible, déjà servi
    // par la bonne place. Le second M doit être absent, surtout pas « présent ».
    expect(scoreGuess('MOMIE', 'TOMBE')).toEqual([
      'absent',
      'correct',
      'correct',
      'absent',
      'correct',
    ])
  })

  it('place une lettre mal placée sur la première occurrence disponible', () => {
    // Deux A dans la tentative, deux dans la cible mais jamais aux mêmes places.
    expect(scoreGuess('AVALA', 'BALAI')).toEqual([
      'present',
      'absent',
      'present',
      'present',
      'absent',
    ])
  })

  it('n’invente pas de lettre présente quand la cible n’en a aucune', () => {
    expect(scoreGuess('MOMIE', 'TOILE')).toEqual([
      'absent',
      'correct',
      'absent',
      'present',
      'correct',
    ])
  })

  it('ne marque aucune lettre présente quand la cible n’en a plus', () => {
    expect(scoreGuess('MMMMM', 'MOMIE')).toEqual([
      'correct',
      'absent',
      'correct',
      'absent',
      'absent',
    ])
  })

  it('traite accents et casse comme le même mot', () => {
    expect(scoreGuess('crâne', 'CRANE')).toEqual([
      'correct',
      'correct',
      'correct',
      'correct',
      'correct',
    ])
  })
})

describe('victoire', () => {
  it('accepte le mot trouvé, accents et casse compris', () => {
    expect(isWinningGuess('crâne', 'CRANE')).toBe(true)
    expect(isWinningGuess('CRANE', 'CRANE')).toBe(true)
  })

  it('refuse un mot différent ou vide', () => {
    expect(isWinningGuess('TOMBE', 'CRANE')).toBe(false)
    expect(isWinningGuess('', 'CRANE')).toBe(false)
  })
})

describe('couleur des touches', () => {
  it('garde la meilleure couleur obtenue', () => {
    expect(bestState(undefined, 'absent')).toBe('absent')
    expect(bestState('absent', 'present')).toBe('present')
    expect(bestState('correct', 'present')).toBe('correct')
    expect(bestState('present', 'correct')).toBe('correct')
  })
})
