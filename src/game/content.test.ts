import { describe, expect, it } from 'vitest'
import {
  GHOST_ID_PATTERN,
  basicGhosts,
  jokerGhosts,
  quizGhosts,
} from './content'
import type { JokerGame } from './types'

const allIds = [
  ...basicGhosts,
  ...quizGhosts.map((ghost) => ghost.id),
  ...jokerGhosts.map((ghost) => ghost.id),
]

describe('intégrité du contenu', () => {
  it('n’a aucun identifiant dupliqué, toutes catégories confondues', () => {
    const seen = new Map<string, number>()
    for (const id of allIds) seen.set(id, (seen.get(id) ?? 0) + 1)
    const duplicates = [...seen.entries()].filter(([, count]) => count > 1).map(([id]) => id)
    expect(duplicates).toEqual([])
  })

  it('n’a que des identifiants au format attendu', () => {
    const malformed = allIds.filter((id) => !GHOST_ID_PATTERN.test(id))
    expect(malformed).toEqual([])
  })

  it('a des énigmes complètes', () => {
    for (const ghost of quizGhosts) {
      expect(ghost.question.trim().length, `énigme ${ghost.id}`).toBeGreaterThan(0)
      expect(ghost.answer.trim().length, `réponse ${ghost.id}`).toBeGreaterThan(0)
      for (const variant of ghost.acceptedAnswers ?? []) {
        expect(variant.trim().length, `variante de ${ghost.id}`).toBeGreaterThan(0)
      }
    }
  })

  it('donne la même réserve de mots à tous les fantômes wordle', () => {
    // La garantie de non-répétition vient d'une permutation unique par joueur, dans
    // laquelle chaque fantôme pioche à son rang. Deux réserves différentes feraient
    // deux permutations indépendantes, et la garantie tomberait sans rien casser
    // de visible — jusqu'à ce qu'un joueur rejoue le même mot (specs/12).
    const reserves = jokerGhosts
      .filter((ghost) => ghost.game === 'wordle')
      .map((ghost) => (ghost.game === 'wordle' ? JSON.stringify(ghost.config.words) : ''))

    expect(new Set(reserves).size).toBeLessThanOrEqual(1)
  })

  it('a des réserves de mots assez grandes pour qu’aucun joueur ne rejoue un mot', () => {
    // Chaque fantôme wordle pioche à son rang dans la permutation du joueur : si la
    // réserve compte moins de mots que de fantômes wordle, les rangs rebouclent et
    // un joueur retombe sur un mot déjà joué (specs/12).
    const wordles = jokerGhosts.filter((ghost) => ghost.game === 'wordle')
    for (const ghost of wordles) {
      if (ghost.game !== 'wordle') continue
      expect(ghost.config.words.length, `réserve de ${ghost.id}`).toBeGreaterThanOrEqual(
        wordles.length,
      )
    }
  })

  it('ne référence que des mini-jeux connus, avec une configuration valide', () => {
    const knownGames: JokerGame[] = ['snake', 'tetris', 'sudoku', 'wordle']

    for (const ghost of jokerGhosts) {
      expect(knownGames, `jeu de ${ghost.id}`).toContain(ghost.game)
      expect(ghost.timeLimitSeconds, `durée de ${ghost.id}`).toBeGreaterThan(0)

      if (ghost.game === 'wordle') {
        expect(ghost.config.words.length, `réserve de mots de ${ghost.id}`).toBeGreaterThan(0)
        for (const word of ghost.config.words) {
          expect(word, `mot « ${word} » de ${ghost.id}`).toHaveLength(5)
        }
        expect(
          new Set(ghost.config.words.map((word) => word.toUpperCase())).size,
          `doublon dans la réserve de ${ghost.id}`,
        ).toBe(ghost.config.words.length)
      }
    }
  })
})
