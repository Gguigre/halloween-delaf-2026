import { sanitize } from '../../game/identity'

export type LetterState = 'correct' | 'present' | 'absent'

export const WORD_LENGTH = 5
export const WORDLE_DEFAULTS = { maxAttempts: 6 }

export const normalizeWord = (word: string): string => sanitize(word)

/**
 * Hachage simple du couple joueur + fantôme : deux joueurs tombent rarement sur le
 * même mot, ce qui limite le bouche-à-oreille, et un même joueur retrouve toujours
 * le sien sans qu'on ait à le stocker (specs/12).
 */
export const pickWord = (words: string[], playerKey: string, ghostId: string): string => {
  if (words.length === 0) return ''
  const seed = `${playerKey}|${ghostId}`
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 2147483647
  }
  return words[hash % words.length]
}

/**
 * Coloration à la manière du vrai Wordle : une lettre présente en un seul exemplaire
 * ne s'affiche « présente » qu'une fois, les bonnes places étant servies d'abord.
 */
export const scoreGuess = (guess: string, target: string): LetterState[] => {
  const attempt = [...normalizeWord(guess)]
  const solution = [...normalizeWord(target)]
  const result: LetterState[] = attempt.map(() => 'absent')

  const remaining = new Map<string, number>()
  attempt.forEach((letter, index) => {
    if (letter === solution[index]) {
      result[index] = 'correct'
    } else if (solution[index] !== undefined) {
      remaining.set(solution[index], (remaining.get(solution[index]) ?? 0) + 1)
    }
  })

  attempt.forEach((letter, index) => {
    if (result[index] === 'correct') return
    const left = remaining.get(letter) ?? 0
    if (left > 0) {
      result[index] = 'present'
      remaining.set(letter, left - 1)
    }
  })

  return result
}

export const isWinningGuess = (guess: string, target: string): boolean =>
  normalizeWord(guess) === normalizeWord(target) && normalizeWord(target).length > 0

/** Couleur retenue par une touche du clavier : la meilleure obtenue jusqu'ici. */
export const bestState = (a: LetterState | undefined, b: LetterState): LetterState => {
  const rank: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 }
  if (!a) return b
  return rank[b] > rank[a] ? b : a
}
