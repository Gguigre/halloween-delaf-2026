import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported, logEvent } from 'firebase/analytics'
import type { Analytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { firebaseConfig } from './config'

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)

export const USERS_COLLECTION = 'Users'

// Analytics est facultatif : bloqueur de pub, Safari privé ou support absent ne
// doivent jamais empêcher un joueur de marquer des points (specs/01).
let analytics: Analytics | null = null

isSupported()
  .then((supported) => {
    if (supported) analytics = getAnalytics(app)
  })
  .catch(() => {
    analytics = null
  })

export const logGameEvent = (name: string, params?: Record<string, string | number | boolean>) => {
  try {
    if (analytics) logEvent(analytics, name, params)
  } catch {
    // Journalisation best-effort : jamais sur le chemin critique.
  }
}
