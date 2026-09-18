/**
 * Clés publiques d'une app web Firebase : committées en clair, comme dans n'importe
 * quelle app Firebase. Elles identifient le projet, elles n'autorisent rien — elles
 * sont de toute façon lisibles dans le bundle servi à chaque joueur.
 *
 * La sécurité repose sur `firestore.rules`. L'alerte « secret détecté » de GitHub
 * sur ce fichier est un faux positif : voir la section dédiée du README, qui décrit
 * le durcissement utile (restriction de la clé par référent HTTP).
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyDgXseWNKmQh_7hiNvDZwlRgPjxnEzRom0',
  authDomain: 'halloween-delaf-2026.firebaseapp.com',
  projectId: 'halloween-delaf-2026',
  storageBucket: 'halloween-delaf-2026.firebasestorage.app',
  messagingSenderId: '192697950402',
  appId: '1:192697950402:web:da2e4a3bae8f6bebaf1b5b',
  measurementId: 'G-9W0YJRBSTR',
}
