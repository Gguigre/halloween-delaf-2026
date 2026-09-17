export class FirestoreTimeoutError extends Error {
  constructor() {
    super("Firestore n'a pas confirmé l'opération à temps")
    this.name = 'FirestoreTimeoutError'
  }
}

export const FIRESTORE_TIMEOUT_MS = 10_000

/**
 * Hors ligne, le SDK Firestore met l'écriture en file d'attente et sa promesse ne se
 * résout jamais : sans ce garde-fou, le joueur reste sur un écran « en cours » infini,
 * sans message ni bouton Réessayer (specs/05).
 *
 * L'écriture en attente partira quand même au retour du réseau. Un Réessayer peut donc
 * produire une seconde écriture — d'où la déduplication défensive du calcul de score.
 */
export const withTimeout = <T>(
  operation: Promise<T>,
  ms: number = FIRESTORE_TIMEOUT_MS,
): Promise<T> => {
  let timer: ReturnType<typeof setTimeout>
  const expiry = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new FirestoreTimeoutError()), ms)
  })

  return Promise.race([operation, expiry]).finally(() => clearTimeout(timer)) as Promise<T>
}
