import type { JokerResult, PlayerDoc, QuizResult } from './types'

export const POINTS_BASIC = 10
export const POINTS_QUIZ_CORRECT = 20
export const POINTS_QUIZ_WRONG = -10
export const POINTS_JOKER_WIN = 50
export const POINTS_JOKER_LOSE = -30

/** 100 basiques + 20 quiz + 10 jokers, tous réussis (specs/05). */
export const MAX_SCORE = 100 * POINTS_BASIC + 20 * POINTS_QUIZ_CORRECT + 10 * POINTS_JOKER_WIN

const uniqueIds = (ids: string[]): string[] => [...new Set(ids)]

/**
 * `arrayUnion` ne déduplique que des objets strictement identiques, or les tentatives
 * portent un horodatage : sans cette précaution, une double écriture compterait double.
 * Un quiz garde sa première tentative (une seconde saisie ne doit rien racheter) ;
 * un joker garde sa victoire, une entrée perdante étant écrite avant chaque partie.
 */
export const uniqueQuizzes = (quizzes: QuizResult[]): QuizResult[] => {
  const kept = new Map<string, QuizResult>()
  for (const quiz of quizzes) if (!kept.has(quiz.id)) kept.set(quiz.id, quiz)
  return [...kept.values()]
}

export const uniqueJokers = (jokers: JokerResult[]): JokerResult[] => {
  const kept = new Map<string, JokerResult>()
  for (const joker of jokers) {
    const previous = kept.get(joker.id)
    if (!previous || (!previous.won && joker.won)) kept.set(joker.id, joker)
  }
  return [...kept.values()]
}

export const scoreOf = (player: PlayerDoc): number => {
  const quizzes = uniqueQuizzes(player.quizzes ?? [])
  const jokers = uniqueJokers(player.jokers ?? [])

  return (
    uniqueIds(player.ghosts ?? []).length * POINTS_BASIC +
    quizzes.filter((quiz) => quiz.correct).length * POINTS_QUIZ_CORRECT +
    quizzes.filter((quiz) => !quiz.correct).length * POINTS_QUIZ_WRONG +
    jokers.filter((joker) => joker.won).length * POINTS_JOKER_WIN +
    jokers.filter((joker) => !joker.won).length * POINTS_JOKER_LOSE
  )
}

/**
 * Départage les ex æquo du classement (specs/13). Les fantômes basiques n'ont pas
 * d'horodatage dans le document, la création de la partie sert alors de repère.
 */
export const lastActionAt = (player: PlayerDoc): number =>
  Math.max(
    player.createdAt ?? 0,
    ...(player.quizzes ?? []).map((quiz) => quiz.at),
    ...(player.jokers ?? []).map((joker) => joker.at),
  )
