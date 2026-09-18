import { useCallback, useEffect, useRef, useState } from 'react'
import { Countdown } from '../../components/Countdown'
import type { MinigameProps } from '../types'
import { useCountdown } from '../useCountdown'
import { WORD_LENGTH, WORDLE_DEFAULTS, bestState, isWinningGuess, normalizeWord, scoreGuess } from './logic'
import type { LetterState } from './logic'
import './WordleGame.css'

/** Le mot est déjà choisi par l'écran joker : le mini-jeu ne sait rien du joueur. */
export type WordleGameConfig = { word: string; maxAttempts?: number }

const ROWS = ['AZERTYUIOP', 'QSDFGHJKLM', 'WXCVBN']

export function WordleGame({ config, timeLimitSeconds, onFinish }: MinigameProps<WordleGameConfig>) {
  const maxAttempts = config.maxAttempts ?? WORDLE_DEFAULTS.maxAttempts
  const target = normalizeWord(config.word)

  const [guesses, setGuesses] = useState<string[]>([])
  const [current, setCurrent] = useState('')
  const [over, setOver] = useState(false)

  const finished = useRef(false)
  const finish = useRef(onFinish)
  useEffect(() => {
    finish.current = onFinish
  }, [onFinish])

  const end = useCallback((won: boolean) => {
    if (finished.current) return
    finished.current = true
    setOver(true)
    finish.current({ won })
  }, [])

  const secondsLeft = useCountdown(timeLimitSeconds, () => end(false))

  // Un essai qui n'est pas un mot du dictionnaire est accepté : pas de dictionnaire
  // embarqué, et refuser un essai valable serait bien plus frustrant (specs/12).
  const validate = () => {
    if (over || current.length !== WORD_LENGTH) return
    const played = [...guesses, current]
    setGuesses(played)
    setCurrent('')
    if (isWinningGuess(current, target)) end(true)
    else if (played.length >= maxAttempts) end(false)
  }

  const type = (letter: string) => {
    if (over || current.length >= WORD_LENGTH) return
    setCurrent((previous) => previous + letter)
  }

  const erase = () => {
    if (over) return
    setCurrent((previous) => previous.slice(0, -1))
  }

  const keyStates = new Map<string, LetterState>()
  guesses.forEach((guess) => {
    const states = scoreGuess(guess, target)
    ;[...guess].forEach((letter, index) => {
      keyStates.set(letter, bestState(keyStates.get(letter), states[index]))
    })
  })

  const rows = Array.from({ length: maxAttempts }, (_, index) => {
    if (index < guesses.length) {
      return { letters: guesses[index], states: scoreGuess(guesses[index], target) }
    }
    if (index === guesses.length) return { letters: current, states: null }
    return { letters: '', states: null }
  })

  return (
    <div className="wordle">
      <div className="wordle-header">
        <Countdown secondsLeft={secondsLeft} />
        <span className="wordle-goal">
          Essai {Math.min(guesses.length + 1, maxAttempts)} / {maxAttempts}
        </span>
      </div>

      <div className="wordle-grid">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="wordle-row">
            {Array.from({ length: WORD_LENGTH }, (_, index) => (
              <div
                key={index}
                className={`wordle-tile${row.states ? ` wordle-${row.states[index]}` : ''}`}
              >
                {row.letters[index] ?? ''}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="wordle-keyboard">
        {ROWS.map((row) => (
          <div key={row} className="wordle-keys">
            {[...row].map((letter) => (
              <button
                key={letter}
                type="button"
                className={`wordle-key${keyStates.has(letter) ? ` wordle-${keyStates.get(letter)}` : ''}`}
                onClick={() => type(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
        <div className="wordle-keys">
          <button type="button" className="wordle-key wordle-wide" onClick={erase}>
            ⌫
          </button>
          <button
            type="button"
            className="wordle-key wordle-wide wordle-enter"
            onClick={validate}
            disabled={current.length !== WORD_LENGTH}
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  )
}
