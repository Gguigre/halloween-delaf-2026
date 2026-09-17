export const COUNTDOWN_WARNING_SECONDS = 10

export const formatCountdown = (secondsLeft: number): string => {
  const safe = Math.max(0, Math.ceil(secondsLeft))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
