export type MinigameResult = { won: boolean }

/**
 * Un mini-jeu ne sait rien du score, du joueur, ni de Firestore : il joue, et rend
 * un booléen une seule fois (skills/minigame-conventions.md).
 */
export type MinigameProps<Config> = {
  config: Config
  timeLimitSeconds: number
  onFinish: (result: MinigameResult) => void
}
