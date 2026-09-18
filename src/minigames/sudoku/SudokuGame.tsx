import { useCallback, useEffect, useRef, useState } from 'react'
import { Countdown } from '../../components/Countdown'
import type { SudokuConfig } from '../../game/types'
import type { MinigameProps } from '../types'
import { useCountdown } from '../useCountdown'
import { BLOCK_COLS, BLOCK_ROWS, SIZE, SUDOKU_DEFAULTS, conflictsAt, generatePuzzle, isSolved } from './logic'
import type { Grid } from './logic'
import './SudokuGame.css'

type Selection = { row: number; column: number } | null

export function SudokuGame({ config, timeLimitSeconds, onFinish }: MinigameProps<SudokuConfig>) {
  const cellsToRemove = config.cellsToRemove ?? SUDOKU_DEFAULTS.cellsToRemove

  const [{ puzzle, givens }] = useState(() => generatePuzzle(cellsToRemove, Math.random))
  const [grid, setGrid] = useState<Grid>(() => puzzle.map((row) => [...row]))
  const [selected, setSelected] = useState<Selection>(null)
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

  // Aucune défaite instantanée sur une saisie erronée : le joueur corrige jusqu'au bout.
  const write = (value: number) => {
    if (over || !selected || givens[selected.row][selected.column]) return
    const next = grid.map((row) => [...row])
    next[selected.row][selected.column] = value
    setGrid(next)
    if (isSolved(next)) end(true)
  }

  return (
    <div className="sudoku">
      <div className="sudoku-header">
        <Countdown secondsLeft={secondsLeft} />
        <span className="sudoku-goal">Remplis toute la grille</span>
      </div>

      <div className="sudoku-grid" aria-label="Grille de sudoku">
        {grid.map((row, rowIndex) =>
          row.map((value, columnIndex) => {
            const given = givens[rowIndex][columnIndex]
            const isSelected =
              selected?.row === rowIndex && selected?.column === columnIndex
            const classes = [
              'sudoku-cell',
              given ? 'sudoku-given' : '',
              isSelected ? 'sudoku-selected' : '',
              conflictsAt(grid, rowIndex, columnIndex) ? 'sudoku-conflict' : '',
              rowIndex % BLOCK_ROWS === 0 ? 'sudoku-block-top' : '',
              columnIndex % BLOCK_COLS === 0 ? 'sudoku-block-left' : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <button
                key={`${rowIndex}-${columnIndex}`}
                type="button"
                className={classes}
                aria-label={`Ligne ${rowIndex + 1}, colonne ${columnIndex + 1}`}
                onClick={() => !given && setSelected({ row: rowIndex, column: columnIndex })}
              >
                {value === 0 ? '' : value}
              </button>
            )
          }),
        )}
      </div>

      <div className="sudoku-pad">
        {Array.from({ length: SIZE }, (_, index) => index + 1).map((value) => (
          <button
            key={value}
            type="button"
            className="sudoku-btn"
            onClick={() => write(value)}
            disabled={!selected}
          >
            {value}
          </button>
        ))}
        <button
          type="button"
          className="sudoku-btn sudoku-erase"
          onClick={() => write(0)}
          disabled={!selected}
        >
          ⌫
        </button>
      </div>
    </div>
  )
}
