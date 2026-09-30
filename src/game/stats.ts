import type { LeaderboardEntry } from './leaderboard'
import { uniqueJokers, uniqueQuizzes } from './scoring'
import type { JokerGame, JokerGhost, QuizGhost } from './types'

export type Content = {
  basic: string[]
  quizzes: QuizGhost[]
  jokers: JokerGhost[]
}

export type GameStats = { game: JokerGame; attempts: number; wins: number }
export type JokerStats = { id: string; game: JokerGame; attempts: number; wins: number }
export type QuizStats = { id: string; question: string; answer: string; attempts: number; correct: number }
export type DayStats = { day: string; actions: number }

export type Stats = {
  players: number
  basicScans: number
  byGame: GameStats[]
  byJoker: JokerStats[]
  byQuiz: QuizStats[]
  neverFound: { basic: string[]; quiz: string[]; joker: string[] }
  activity: DayStats[]
}

export const dayOf = (timestamp: number): string =>
  new Date(timestamp).toISOString().slice(0, 10)

export const rate = (part: number, total: number): number =>
  total === 0 ? 0 : Math.round((part / total) * 100)

/**
 * Tout se recalcule depuis les documents joueurs, comme le score : aucune donnée
 * de suivi n'est stockée à part, et un bloqueur de pub ne peut rien en amputer —
 * contrairement à Analytics.
 */
export const buildStats = (entries: LeaderboardEntry[], content: Content): Stats => {
  const byGame = new Map<JokerGame, GameStats>()
  const byJoker = new Map<string, JokerStats>()
  const byQuiz = new Map<string, QuizStats>()
  const perDay = new Map<string, number>()

  for (const ghost of content.jokers) {
    byJoker.set(ghost.id, { id: ghost.id, game: ghost.game, attempts: 0, wins: 0 })
    if (!byGame.has(ghost.game)) byGame.set(ghost.game, { game: ghost.game, attempts: 0, wins: 0 })
  }

  for (const ghost of content.quizzes) {
    byQuiz.set(ghost.id, {
      id: ghost.id,
      question: ghost.question,
      answer: ghost.answer,
      attempts: 0,
      correct: 0,
    })
  }

  const foundBasic = new Set<string>()
  let basicScans = 0

  for (const { player } of entries) {
    for (const id of new Set(player.ghosts ?? [])) {
      foundBasic.add(id)
      basicScans += 1
    }

    for (const quiz of uniqueQuizzes(player.quizzes ?? [])) {
      const stats = byQuiz.get(quiz.id)
      if (stats) {
        stats.attempts += 1
        if (quiz.correct) stats.correct += 1
      }
      perDay.set(dayOf(quiz.at), (perDay.get(dayOf(quiz.at)) ?? 0) + 1)
    }

    for (const joker of uniqueJokers(player.jokers ?? [])) {
      const stats = byJoker.get(joker.id)
      if (stats) {
        stats.attempts += 1
        if (joker.won) stats.wins += 1
        const game = byGame.get(stats.game)
        if (game) {
          game.attempts += 1
          if (joker.won) game.wins += 1
        }
      }
      perDay.set(dayOf(joker.at), (perDay.get(dayOf(joker.at)) ?? 0) + 1)
    }
  }

  const attempted = (ids: string[], seen: Set<string>) => ids.filter((id) => !seen.has(id))
  const quizSeen = new Set([...byQuiz.values()].filter((q) => q.attempts > 0).map((q) => q.id))
  const jokerSeen = new Set([...byJoker.values()].filter((j) => j.attempts > 0).map((j) => j.id))

  return {
    players: entries.length,
    basicScans,
    byGame: [...byGame.values()],
    byJoker: [...byJoker.values()],
    byQuiz: [...byQuiz.values()],
    neverFound: {
      basic: content.basic.filter((id) => !foundBasic.has(id)),
      quiz: attempted(
        content.quizzes.map((ghost) => ghost.id),
        quizSeen,
      ),
      joker: attempted(
        content.jokers.map((ghost) => ghost.id),
        jokerSeen,
      ),
    },
    activity: [...perDay.entries()]
      .map(([day, actions]) => ({ day, actions }))
      .sort((a, b) => a.day.localeCompare(b.day)),
  }
}
