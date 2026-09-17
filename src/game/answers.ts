import { sanitize } from './identity'
import type { QuizGhost } from './types'

/**
 * Une mauvaise réponse coûte 10 points : la tolérance doit être généreuse, sinon le
 * jeu paraît injuste (specs/07).
 *
 * La saisie passe si elle correspond à la réponse ou à une variante déclarée, ou si
 * l'un de ses mots correspond — ce qui fait passer « une boussole », « la boussole »,
 * « c'est une boussole ». La faute d'orthographe n'est pas rattrapée : pas de distance
 * de Levenshtein, trop imprévisible quand des points sont en jeu.
 */
export const isAnswerCorrect = (input: string, ghost: QuizGhost): boolean => {
  const expected = new Set(
    [ghost.answer, ...(ghost.acceptedAnswers ?? [])].map(sanitize).filter(Boolean),
  )
  if (expected.size === 0) return false

  const whole = sanitize(input)
  if (whole.length === 0) return false
  if (expected.has(whole)) return true

  return input
    .split(/\s+/)
    .map(sanitize)
    .some((word) => word.length > 0 && expected.has(word))
}
