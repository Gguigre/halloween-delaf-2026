import { useCallback, useEffect, useRef, useState } from 'react'
import { Countdown } from '../../components/Countdown'
import type { TetrisConfig } from '../../game/types'
import type { MinigameProps } from '../types'
import { useCountdown } from '../useCountdown'
import {
  TETRIS_DEFAULTS,
  createTetrisState,
  drop,
  hardDrop,
  merge,
  moveLeft,
  moveRight,
  rotate,
} from './logic'
import type { TetrisState } from './logic'
import './TetrisGame.css'

export function TetrisGame({ config, timeLimitSeconds, onFinish }: MinigameProps<TetrisConfig>) {
  const cols = config.cols ?? TETRIS_DEFAULTS.cols
  const rows = config.rows ?? TETRIS_DEFAULTS.rows
  const targetLines = config.targetLines ?? TETRIS_DEFAULTS.targetLines
  const dropMs = config.dropMs ?? TETRIS_DEFAULTS.dropMs
  const rules = { cols, rows, targetLines }

  const [state, setState] = useState(() => createTetrisState(rules, Math.random))

  const finished = useRef(false)
  const finish = useRef(onFinish)
  useEffect(() => {
    finish.current = onFinish
  }, [onFinish])

  useEffect(() => {
    if (!state.over || finished.current) return
    finished.current = true
    finish.current({ won: state.won })
  }, [state.over, state.won])

  const stop = useCallback(() => {
    setState((previous) => (previous.over ? previous : { ...previous, over: true, won: false }))
  }, [])

  const secondsLeft = useCountdown(timeLimitSeconds, stop)

  useEffect(() => {
    if (state.over) return undefined
    const timer = setInterval(() => {
      setState((previous) => drop(previous, { cols, rows, targetLines }, Math.random))
    }, dropMs)
    return () => clearInterval(timer)
  }, [state.over, cols, rows, targetLines, dropMs])

  const apply = useCallback((change: (previous: TetrisState) => TetrisState) => {
    setState(change)
  }, [])

  const view = state.piece ? merge(state.board, state.piece) : state.board

  return (
    <div className="tetris">
      <div className="tetris-header">
        <Countdown secondsLeft={secondsLeft} />
        <span className="tetris-goal">
          Lignes : {state.lines} / {targetLines}
        </span>
      </div>

      <div
        className="tetris-board"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, aspectRatio: `${cols} / ${rows}` }}
        aria-label="Plateau de Tetris"
      >
        {view.flat().map((cell, index) => (
          <div key={index} className={`tetris-cell${cell ? ` tetris-p${cell}` : ''}`} />
        ))}
      </div>

      <div className="tetris-pad">
        <button type="button" className="tetris-btn" onClick={() => apply(moveLeft)}>
          ◀
        </button>
        <button type="button" className="tetris-btn" onClick={() => apply(rotate)}>
          ↻
        </button>
        <button type="button" className="tetris-btn" onClick={() => apply(moveRight)}>
          ▶
        </button>
        <button
          type="button"
          className="tetris-btn"
          onClick={() => apply((previous) => drop(previous, rules, Math.random))}
        >
          ▼
        </button>
        <button
          type="button"
          className="tetris-btn tetris-hard"
          onClick={() => apply((previous) => hardDrop(previous, rules, Math.random))}
        >
          ⤓
        </button>
      </div>
    </div>
  )
}
