import { arrayUnion, doc, getDoc, runTransaction, updateDoc } from 'firebase/firestore'
import type { JokerResult, PlayerDoc, QuizResult } from '../game/types'
import { USERS_COLLECTION, db } from './firebase'

export class PlayerAlreadyExistsError extends Error {
  constructor() {
    super('Ce prénom avec ce code existe déjà')
    this.name = 'PlayerAlreadyExistsError'
  }
}

const playerRef = (docId: string) => doc(db, USERS_COLLECTION, docId)

export const fetchPlayer = async (docId: string): Promise<PlayerDoc | null> => {
  const snapshot = await getDoc(playerRef(docId))
  return snapshot.exists() ? (snapshot.data() as PlayerDoc) : null
}

/**
 * Seule écriture d'un document complet autorisée (specs/05). La transaction garantit
 * qu'une partie existante n'est jamais écrasée, même si deux onglets créent en même temps.
 */
export const createPlayer = async (
  docId: string,
  name: string,
  pin: string,
): Promise<PlayerDoc> => {
  const player: PlayerDoc = {
    name: name.trim(),
    pin,
    ghosts: [],
    quizzes: [],
    jokers: [],
    createdAt: Date.now(),
  }

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(playerRef(docId))
    if (snapshot.exists()) throw new PlayerAlreadyExistsError()
    transaction.set(playerRef(docId), player)
  })

  return player
}

export const addBasicGhost = (docId: string, ghostId: string): Promise<void> =>
  updateDoc(playerRef(docId), { ghosts: arrayUnion(ghostId) })

export const addQuizResult = (docId: string, result: QuizResult): Promise<void> =>
  updateDoc(playerRef(docId), { quizzes: arrayUnion(result) })

export const startJokerAttempt = (docId: string, result: JokerResult): Promise<void> =>
  updateDoc(playerRef(docId), { jokers: arrayUnion(result) })

/**
 * Seule écriture du jeu qui modifie une entrée existante (specs/08) : la transaction
 * ne réécrit que le champ `jokers`, jamais le document entier.
 */
export const markJokerWon = (docId: string, jokerId: string): Promise<void> =>
  runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(playerRef(docId))
    if (!snapshot.exists()) throw new Error('Partie introuvable')

    const jokers = (snapshot.data() as PlayerDoc).jokers ?? []
    const updated = jokers.some((joker) => joker.id === jokerId)
      ? jokers.map((joker) => (joker.id === jokerId ? { ...joker, won: true } : joker))
      : [...jokers, { id: jokerId, won: true, at: Date.now() }]

    transaction.update(playerRef(docId), { jokers: updated })
  })
