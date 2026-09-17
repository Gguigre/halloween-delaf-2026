export type StoredIdentity = { name: string; pin: string }

const STORAGE_KEY = 'chasse-fantomes-2026:identite'

// Raccourci pour ne pas redemander prénom et code à chaque scan, rien de plus :
// Safari efface le stockage au bout de sept jours sans visite (specs/04).
export const readStoredIdentity = (): StoredIdentity | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as StoredIdentity).name === 'string' &&
      typeof (parsed as StoredIdentity).pin === 'string'
    ) {
      return parsed as StoredIdentity
    }
    return null
  } catch {
    return null
  }
}

export const writeStoredIdentity = (identity: StoredIdentity): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity))
  } catch {
    // Stockage indisponible (navigation privée) : le joueur repassera par « J'ai déjà joué ».
  }
}

export const clearStoredIdentity = (): void => {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Rien à faire : l'identité sera simplement redemandée.
  }
}
