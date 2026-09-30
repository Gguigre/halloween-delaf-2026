import basic1 from '../assets/ghosts/basic-1.jpeg'
import basic2 from '../assets/ghosts/basic-2.jpeg'
import basic3 from '../assets/ghosts/basic-3.jpeg'
import basic4 from '../assets/ghosts/basic-4.jpeg'

export type QrBox = { x: number; y: number; w: number; h: number }

/**
 * Position du repère magenta, en pourcentage de l'image, mesurée sur les 4
 * visuels fournis (basic-1 à 4) : les quatre convergent à moins de 0,5 point
 * les uns des autres. Si un nouveau visuel est ajouté avec un repère placé
 * ailleurs, cette valeur ne lui correspondra plus — la remesurer avant de
 * l'utiliser (un script de détection par couleur suffit).
 */
export const BASIC_QR_BOX: QrBox = { x: 32.0, y: 41.4, w: 40.7, h: 30.6 }

// Les visuels quiz et joker arrivent séparément : cette liste ne couvre que
// les fantômes basiques pour l'instant.
export const basicGhostArt: string[] = [basic1, basic2, basic3, basic4]

/** Répartition en tournante : le fantôme n d'une liste triée reçoit le visuel n % k. */
export const basicArtFor = (index: number): string =>
  basicGhostArt[index % basicGhostArt.length]
