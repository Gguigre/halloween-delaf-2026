import { sanitize } from '../../game/identity'

export type LetterState = 'correct' | 'present' | 'absent'

export const WORD_LENGTH = 5
export const WORDLE_DEFAULTS = { maxAttempts: 6 }

export const normalizeWord = (word: string): string => sanitize(word)

/** xorshift32 amorcé par FNV-1a : mélange correct, contrairement à un simple *31. */
const seededRandom = (seed: string): (() => number) => {
  let state = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index)
    state = Math.imul(state, 16777619)
  }
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return (state >>> 0) / 4294967296
  }
}

/**
 * Le joueur reçoit une permutation de la réserve qui lui est propre, et chaque
 * fantôme wordle pioche à son rang dedans (specs/12).
 *
 * Tirer indépendamment sur le couple joueur + fantôme paraissait suffisant, mais
 * le résultat dépendait alors surtout de la paire d'identifiants : selon les ids
 * tirés, jusqu'à 80 % des joueurs retombaient sur le même mot à leur second
 * fantôme wordle. Ici, deux rangs distincts donnent deux mots distincts par
 * construction, quels que soient les identifiants — à condition que la réserve
 * compte au moins autant de mots que de fantômes wordle, ce qu'un test vérifie.
 */
export const pickWord = (words: string[], playerKey: string, ghostIndex: number): string => {
  if (words.length === 0) return ''

  const random = seededRandom(playerKey)
  const shuffled = [...words]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.min(i, Math.floor(random() * (i + 1)))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled[((ghostIndex % words.length) + words.length) % words.length]
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
