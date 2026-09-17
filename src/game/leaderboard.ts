import { MAX_SCORE, lastActionAt, scoreOf } from './scoring'
import type { PlayerDoc } from './types'

export type LeaderboardEntry = { docId: string; player: PlayerDoc }

export type LeaderboardRow = {
  docId: string
  name: string
  score: number
  lastActionAt: number
  rank: number
}

/**
 * À score égal, le plus ancien passe devant : celui qui y est arrivé le premier
 * garde sa place (specs/13).
 */
export const buildLeaderboard = (entries: LeaderboardEntry[]): LeaderboardRow[] =>
  entries
    .map(({ docId, player }) => ({
      docId,
      name: player.name,
      score: scoreOf(player),
      lastActionAt: lastActionAt(player),
    }))
    .sort((a, b) => b.score - a.score || a.lastActionAt - b.lastActionAt)
    .map((row, index) => ({ ...row, rank: index + 1 }))

/** Un score négatif produirait une largeur de barre invalide (specs/13). */
export const progressPercent = (score: number): number =>
  Math.min(100, Math.max(0, (score / MAX_SCORE) * 100))
