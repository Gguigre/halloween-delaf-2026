import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ErrorState } from '../components/ErrorState'
import { FloatingGhost } from '../components/FloatingGhost'
import { ResultBanner } from '../components/ResultBanner'
import { UnknownGhost } from '../components/UnknownGhost'
import { logGameEvent } from '../firebase/firebase'
import { addQuizResult } from '../firebase/players'
import { isAnswerCorrect } from '../game/answers'
import { findQuizGhost } from '../game/content'
import { POINTS_QUIZ_CORRECT, POINTS_QUIZ_WRONG } from '../game/scoring'
import type { QuizGhost } from '../game/types'
import { usePlayerContext, usePlayerSession } from '../player/context'

type Status = 'form' | 'pending' | 'error' | 'done'

export function QuizGhostPage() {
  const { id = '' } = useParams()
  const { docId, player } = usePlayerSession()
  const { reload } = usePlayerContext()
  const ghost = findQuizGhost(id)

  // Figé au montage : l'écriture qu'on vient de faire ne doit pas basculer
  // l'écran de résultat sur celui d'un quiz déjà répondu (specs/05).
  const [previous] = useState(() => player.quizzes?.find((quiz) => quiz.id === id))

  const [answer, setAnswer] = useState('')
  const [verdict, setVerdict] = useState(false)
  const [status, setStatus] = useState<Status>('form')

  if (!ghost) return <UnknownGhost />

  const record = async (correct: boolean) => {
    setStatus('pending')
    try {
      await addQuizResult(docId, { id, correct, at: Date.now() })
      logGameEvent('quiz_answered', { ghost: id, correct })
      try {
        await reload()
      } catch {
        // Le score se rafraîchira au prochain chargement : la réponse, elle, est enregistrée.
      }
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (answer.trim().length === 0) return
    const correct = isAnswerCorrect(answer, ghost)
    setVerdict(correct)
    void record(correct)
  }

  if (previous) return <QuizResult correct={previous.correct} ghost={ghost} replay />

  if (status === 'pending') {
    return (
      <div className="center">
        <FloatingGhost size={110} />
        <p className="pending">On vérifie ta réponse…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <ErrorState
        message="On n'arrive pas à enregistrer ta réponse : ta connexion a lâché. Réessaie, ta réponse est gardée."
        onRetry={() => void record(verdict)}
      />
    )
  }

  if (status === 'done') return <QuizResult correct={verdict} ghost={ghost} />

  return (
    <form onSubmit={submit}>
      <h1 className="center">👻 Énigme</h1>

      <div className="card">
        {/* Contenu du jeu, écrit à la main et embarqué au build : HTML inline
            autorisé pour les retours à la ligne (specs/03). */}
        <p dangerouslySetInnerHTML={{ __html: ghost.question }} />
      </div>

      <div className="card card-warning">
        <p>
          <strong>Un seul essai.</strong> Bonne réponse : <strong>+20 points</strong>. Mauvaise
          réponse : <strong>−10 points</strong>.
        </p>
        <p className="muted">À toi de voir si tu tentes le coup.</p>
      </div>

      <div className="field">
        <label htmlFor="answer">Ta réponse</label>
        <input
          id="answer"
          type="text"
          value={answer}
          autoComplete="off"
          onChange={(event) => setAnswer(event.target.value)}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={answer.trim().length === 0}>
        Je valide ma réponse
      </button>
    </form>
  )
}

function QuizResult({
  correct,
  ghost,
  replay = false,
}: {
  correct: boolean
  ghost: QuizGhost
  replay?: boolean
}) {
  return (
    <div>
      {replay && <p className="center muted">Tu as déjà répondu à cette énigme.</p>}
      <ResultBanner
        won={correct}
        delta={correct ? POINTS_QUIZ_CORRECT : POINTS_QUIZ_WRONG}
        title={correct ? 'Bravo, bonne réponse !' : 'Dommage !'}
      >
        {!correct && (
          <p>
            La bonne réponse était : <strong>{ghost.answer}</strong>
          </p>
        )}
      </ResultBanner>
    </div>
  )
}
