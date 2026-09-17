import type { JokerGame, JokerGhost } from '../game/types'

/** Les trois autres mini-jeux arrivent au jalon suivant. */
export const AVAILABLE_GAMES: JokerGame[] = ['snake']

export const GAME_LABELS: Record<JokerGame, string> = {
  snake: 'Snake',
  tetris: 'Tetris',
  sudoku: 'Sudoku',
  wordle: 'Wordle',
}

/** Objectif chiffré, annoncé avant le lancement (specs/08). */
export const goalOf = (ghost: JokerGhost): string => {
  switch (ghost.game) {
    case 'snake':
      return `manger ${ghost.config.targetApples ?? 10} pommes`
    case 'tetris':
      return `effacer ${ghost.config.targetLines ?? 3} lignes`
    case 'sudoku':
      return 'remplir toute la grille'
    case 'wordle':
      return `trouver le mot en ${ghost.config.maxAttempts ?? 6} essais`
  }
}
