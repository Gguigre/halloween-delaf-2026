export const MAX_NAME_LENGTH = 20

/**
 * Minuscules, sans accents, sans ponctuation ni espaces. Sert à la fois à dériver
 * la clé du document joueur (specs/04) et à comparer les réponses aux énigmes (specs/07).
 */
export const sanitize = (input: string): string =>
  input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

export const isValidPin = (pin: string): boolean => /^[0-9]{4}$/.test(pin)

export const isValidName = (name: string): boolean => {
  const trimmed = name.trim()
  return trimmed.length > 0 && trimmed.length <= MAX_NAME_LENGTH && sanitize(trimmed).length > 0
}

export const playerDocId = (name: string, pin: string): string => {
  const key = sanitize(name)
  if (key.length === 0) throw new Error('Prénom inutilisable après normalisation')
  if (!isValidPin(pin)) throw new Error('Code invalide')
  return `${key}-${pin}`
}
