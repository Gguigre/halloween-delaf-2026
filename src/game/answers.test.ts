import { describe, expect, it } from 'vitest'
import { isAnswerCorrect } from './answers'
import type { QuizGhost } from './types'

const boussole: QuizGhost = {
  id: 'AB23CD',
  question: 'Qui suis-je ?',
  answer: 'boussole',
}

const citrouille: QuizGhost = {
  id: 'EF45GH',
  question: 'Quel légume ?',
  answer: 'la citrouille',
  acceptedAnswers: ['citrouille', 'citrouilles', 'potiron'],
}

describe('isAnswerCorrect', () => {
  it('accepte la réponse exacte', () => {
    expect(isAnswerCorrect('boussole', boussole)).toBe(true)
  })

  it('ignore la casse, les accents et la ponctuation', () => {
    expect(isAnswerCorrect('LA Boussole', boussole)).toBe(true)
    expect(isAnswerCorrect('boussole.', boussole)).toBe(true)
    expect(isAnswerCorrect('  Boussole !  ', boussole)).toBe(true)
  })

  it('accepte un article ou une phrase autour de la réponse', () => {
    expect(isAnswerCorrect('une boussole', boussole)).toBe(true)
    expect(isAnswerCorrect('la boussole', boussole)).toBe(true)
    expect(isAnswerCorrect("c'est une boussole", boussole)).toBe(true)
  })

  it('accepte les variantes déclarées', () => {
    expect(isAnswerCorrect('citrouille', citrouille)).toBe(true)
    expect(isAnswerCorrect('des citrouilles', citrouille)).toBe(true)
    expect(isAnswerCorrect('un potiron', citrouille)).toBe(true)
    expect(isAnswerCorrect('la citrouille', citrouille)).toBe(true)
  })

  it('ne rattrape pas les fautes d’orthographe', () => {
    expect(isAnswerCorrect('bousole', boussole)).toBe(false)
    expect(isAnswerCorrect('citrouil', citrouille)).toBe(false)
  })

  it('refuse une réponse vide ou sans lettre', () => {
    expect(isAnswerCorrect('', boussole)).toBe(false)
    expect(isAnswerCorrect('   ', boussole)).toBe(false)
    expect(isAnswerCorrect('???', boussole)).toBe(false)
    expect(isAnswerCorrect('👻', boussole)).toBe(false)
  })

  it('refuse une réponse qui n’a rien à voir', () => {
    expect(isAnswerCorrect('un chat noir', boussole)).toBe(false)
  })

  it('traite la ligature œ comme oe', () => {
    const oeuf: QuizGhost = { id: 'IJ67KL', question: 'Quoi ?', answer: 'un oeuf' }
    expect(isAnswerCorrect('un œuf', oeuf)).toBe(true)
    expect(isAnswerCorrect('un oeuf', oeuf)).toBe(true)
  })
})
