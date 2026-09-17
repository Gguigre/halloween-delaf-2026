import { useEffect, useRef, useState } from 'react'

/**
 * Compte à rebours démarré au montage, sans pause (skills/minigame-conventions.md).
 * Il s'appuie sur l'horloge et non sur un compteur de ticks : un navigateur mobile
 * ralentit les timers, et un chrono qui dérive fausserait la durée annoncée.
 */
export const useCountdown = (totalSeconds: number, onExpire: () => void): number => {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const expire = useRef(onExpire)

  useEffect(() => {
    expire.current = onExpire
  }, [onExpire])

  useEffect(() => {
    const deadline = Date.now() + totalSeconds * 1000
    let fired = false

    const tick = () => {
      const left = (deadline - Date.now()) / 1000
      setSecondsLeft(Math.max(0, left))
      if (left <= 0 && !fired) {
        fired = true
        clearInterval(timer)
        expire.current()
      }
    }

    const timer = setInterval(tick, 200)
    return () => clearInterval(timer)
  }, [totalSeconds])

  return secondsLeft
}
