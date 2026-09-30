import basicGhostsData from '../assets/basicGhosts.json'
import jokerGhostsData from '../assets/jokerGhosts.json'
import quizGhostsData from '../assets/quizGhosts.json'
import type { JokerGhost, QuizGhost } from './types'

export const GHOST_ID_ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ'
export const GHOST_ID_LENGTH = 6
export const GHOST_ID_PATTERN = new RegExp(`^[${GHOST_ID_ALPHABET}]{${GHOST_ID_LENGTH}}$`)

export const basicGhosts: string[] = basicGhostsData
export const quizGhosts = quizGhostsData as QuizGhost[]
export const jokerGhosts = jokerGhostsData as JokerGhost[]

export const isBasicGhost = (id: string): boolean => basicGhosts.includes(id)

export const findQuizGhost = (id: string): QuizGhost | undefined =>
  quizGhosts.find((ghost) => ghost.id === id)

export const findJokerGhost = (id: string): JokerGhost | undefined =>
  jokerGhosts.find((ghost) => ghost.id === id)

/** Rang du fantôme parmi les fantômes wordle : c'est lui qui garantit qu'un joueur
 *  ne retombe jamais deux fois sur le même mot (specs/12). */
export const wordleGhostIds: string[] = jokerGhosts
  .filter((ghost) => ghost.game === 'wordle')
  .map((ghost) => ghost.id)

export const wordleIndexOf = (id: string): number => wordleGhostIds.indexOf(id)
