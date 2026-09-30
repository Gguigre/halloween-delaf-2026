import basic0 from '../assets/ghosts/basic-0.jpeg'
import basic1 from '../assets/ghosts/basic-1.jpeg'
import basic2 from '../assets/ghosts/basic-2.jpeg'
import basic3 from '../assets/ghosts/basic-3.jpeg'
import basic4 from '../assets/ghosts/basic-4.jpeg'
import basic5 from '../assets/ghosts/basic-5.jpeg'
import basic6 from '../assets/ghosts/basic-6.jpeg'
import basic7 from '../assets/ghosts/basic-7.jpeg'
import basic8 from '../assets/ghosts/basic-8.jpeg'
import basic9 from '../assets/ghosts/basic-9.jpeg'
import basic10 from '../assets/ghosts/basic-10.jpeg'
import basic11 from '../assets/ghosts/basic-11.jpeg'
import basic12 from '../assets/ghosts/basic-12.jpeg'
import basic13 from '../assets/ghosts/basic-13.jpeg'
import basic14 from '../assets/ghosts/basic-14.jpeg'
import basic15 from '../assets/ghosts/basic-15.jpeg'
import basic16 from '../assets/ghosts/basic-16.jpeg'
import basic17 from '../assets/ghosts/basic-17.jpeg'
import basic18 from '../assets/ghosts/basic-18.jpeg'
import jokerArtSrc from '../assets/ghosts/joker-0.jpeg'
import quizArtSrc from '../assets/ghosts/quiz-0.jpeg'

export type QrBox = { x: number; y: number; w: number; h: number }
export type GhostArt = { src: string; box: QrBox }

/**
 * Position du repère magenta, en % de l'image, mesurée par script sur chaque
 * visuel (détection par couleur, fenêtre restreinte pour ignorer les
 * décorations colorées proches — cœurs, éclair, queue — qui autrement se
 * confondent avec le repère). Remesurer avant d'ajouter un nouveau visuel.
 *
 * `basic-10` (l'éclair) : le trait déborde volontairement dans le carré,
 * confirmé par Guillaume — la position standard s'applique quand même.
 */
export const basicGhostArt: GhostArt[] = [
  { src: basic0, box: { x: 31.8, y: 41.5, w: 41.0, h: 30.7 } },
  { src: basic1, box: { x: 31.8, y: 41.6, w: 40.5, h: 30.3 } },
  { src: basic2, box: { x: 32.2, y: 41.4, w: 40.5, h: 30.7 } },
  { src: basic3, box: { x: 31.8, y: 41.0, w: 40.6, h: 30.6 } },
  { src: basic4, box: { x: 32.0, y: 41.6, w: 40.8, h: 30.5 } },
  { src: basic5, box: { x: 32.0, y: 41.0, w: 40.5, h: 30.5 } },
  { src: basic6, box: { x: 31.9, y: 41.5, w: 40.8, h: 30.5 } },
  { src: basic7, box: { x: 32.1, y: 41.5, w: 40.5, h: 30.4 } },
  { src: basic8, box: { x: 32.0, y: 41.2, w: 40.5, h: 30.8 } },
  { src: basic9, box: { x: 31.4, y: 41.3, w: 40.7, h: 30.7 } },
  { src: basic10, box: { x: 32.0, y: 41.4, w: 40.7, h: 30.6 } },
  { src: basic11, box: { x: 32.7, y: 41.1, w: 40.5, h: 30.5 } },
  { src: basic12, box: { x: 31.7, y: 41.3, w: 40.5, h: 30.6 } },
  { src: basic13, box: { x: 32.1, y: 40.8, w: 40.6, h: 31.1 } },
  { src: basic14, box: { x: 32.1, y: 41.2, w: 40.9, h: 30.7 } },
  { src: basic15, box: { x: 31.6, y: 41.4, w: 40.9, h: 30.5 } },
  { src: basic16, box: { x: 32.3, y: 41.4, w: 40.5, h: 30.6 } },
  { src: basic17, box: { x: 32.3, y: 41.2, w: 40.6, h: 30.6 } },
  { src: basic18, box: { x: 32.2, y: 41.6, w: 40.3, h: 30.5 } },
]

/** Index 0 = basic-0 (le visuel neutre), 1 à 18 = les variantes décorées. */
const VARIANT_COUNT = basicGhostArt.length - 1

/**
 * Deux occurrences de chaque variante décorée, réparties régulièrement sur
 * l'ensemble des fantômes plutôt que regroupées en tête de liste — pour que
 * chaque page imprimée montre un mélange, pas dix planches identiques suivies
 * de dix planches toutes différentes. Le reste retombe sur `basic-0`.
 */
export const buildArtPlan = (total: number): number[] => {
  const plan = new Array<number>(total).fill(0)
  const occurrences = Math.min(2, Math.floor(total / VARIANT_COUNT))

  const slots = occurrences * VARIANT_COUNT
  for (let k = 0; k < slots; k += 1) {
    const slot = Math.floor((k * total) / slots)
    if (plan[slot] !== 0) continue // évite d'écraser un slot déjà pris par arrondi
    plan[slot] = (k % VARIANT_COUNT) + 1
  }

  return plan
}

const ART_PLAN = buildArtPlan(100)

export const artFor = (index: number): GhostArt =>
  basicGhostArt[ART_PLAN[index % ART_PLAN.length] ?? 0]

/**
 * Un seul visuel partagé pour tous les fantômes quiz, et pour tous les jokers.
 * Contrairement aux basiques, le corps est en aplat de couleur pleine : sans
 * fond blanc sous le QR (`QR_QUIET_ZONE_RATIO`, voir AllCodesPage), le code
 * touche directement le violet ou l'orange, sans zone de silence.
 */
export const quizArt: GhostArt = {
  src: quizArtSrc,
  box: { x: 32.0, y: 41.3, w: 40.7, h: 30.6 },
}

export const jokerArt: GhostArt = {
  src: jokerArtSrc,
  box: { x: 32.0, y: 41.3, w: 40.7, h: 30.6 },
}
