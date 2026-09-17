import './Countdown.css'
import { COUNTDOWN_WARNING_SECONDS, formatCountdown } from './countdownFormat'

export function Countdown({ secondsLeft }: { secondsLeft: number }) {
  const urgent = secondsLeft <= COUNTDOWN_WARNING_SECONDS

  return (
    <div
      className={`countdown ${urgent ? 'countdown-urgent' : ''}`}
      role="timer"
      aria-label="Temps restant"
    >
      ⏳ {formatCountdown(secondsLeft)}
    </div>
  )
}
