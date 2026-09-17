import { useState } from 'react'
import { FloatingGhost } from '../components/FloatingGhost'
import { logGameEvent } from '../firebase/firebase'
import { PlayerAlreadyExistsError, createPlayer, fetchPlayer } from '../firebase/players'
import {
  MAX_NAME_LENGTH,
  OATH_SENTENCE,
  isOathFulfilled,
  isValidName,
  isValidPin,
  playerDocId,
} from '../game/identity'
import { usePlayerContext } from './context'

type Mode = 'choice' | 'new' | 'returning'

const NETWORK_MESSAGE =
  "Impossible de joindre le jeu. Vérifie ta connexion, puis réessaie — rien n'est perdu."

export function Onboarding() {
  const [mode, setMode] = useState<Mode>('choice')

  if (mode === 'new') return <NewPlayerForm onBack={() => setMode('choice')} />
  if (mode === 'returning') return <ReturningPlayerForm onBack={() => setMode('choice')} />

  return (
    <div>
      <h1 className="center">🎃 Chasse aux fantômes</h1>
      <FloatingGhost size={110} />
      <div className="card">
        <p>
          Des fantômes en papier sont cachés dans le service. Scanne-les avec ton téléphone :
          chacun te rapporte des points, et certains peuvent t'en faire perdre.
        </p>
        <p className="muted">
          Un classement en direct montre où tu en es par rapport aux collègues.
        </p>
      </div>
      <button type="button" className="btn btn-primary" onClick={() => setMode('new')}>
        Je commence
      </button>
      <button type="button" className="btn btn-secondary" onClick={() => setMode('returning')}>
        J'ai déjà joué
      </button>
    </div>
  )
}

function NewPlayerForm({ onBack }: { onBack: () => void }) {
  const { signIn } = usePlayerContext()
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [oath, setOath] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pinsMatch = pin === pinConfirm
  const oathFulfilled = isOathFulfilled(oath)
  const canSubmit = isValidName(name) && isValidPin(pin) && pinsMatch && oathFulfilled && !pending

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    setPending(true)
    setError(null)
    try {
      const docId = playerDocId(name, pin)
      const player = await createPlayer(docId, name, pin)
      logGameEvent('player_created')
      signIn({ docId, player })
    } catch (caught) {
      setError(
        caught instanceof PlayerAlreadyExistsError
          ? "Ce prénom avec ce code existe déjà : choisis un autre code — ou reviens en arrière et utilise « J'ai déjà joué » si c'est toi."
          : NETWORK_MESSAGE,
      )
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <h1>On y va !</h1>
      <p>
        Des fantômes en papier sont cachés dans le service : scanne-les pour marquer des points.
      </p>
      <p className="muted">Quiz et jokers peuvent rapporter gros… ou coûter cher.</p>

      <div className="field">
        <label htmlFor="name">Ton prénom</label>
        <input
          id="name"
          type="text"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          autoComplete="given-name"
          onChange={(event) => setName(event.target.value)}
        />
        <p className="field-hint">C'est ce prénom qui s'affichera au classement.</p>
      </div>

      <div className="field">
        <label htmlFor="pin">Choisis un code à 4 chiffres</label>
        <input
          id="pin"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={pin}
          maxLength={4}
          autoComplete="off"
          onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))}
        />
        <p className="field-hint">
          Il te servira si tu changes de téléphone ou si le jeu t'oublie. Prends-en un que tu
          connais déjà par cœur.
        </p>
      </div>

      <div className="field">
        <label htmlFor="pin-confirm">Redonne ton code</label>
        <input
          id="pin-confirm"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={pinConfirm}
          maxLength={4}
          autoComplete="off"
          onChange={(event) => setPinConfirm(event.target.value.replace(/\D/g, ''))}
        />
        {pinConfirm.length === 4 && !pinsMatch && (
          <p className="field-error">Les deux codes ne sont pas les mêmes.</p>
        )}
      </div>

      <div className="oath">
        <p className="oath-intro">
          Les fantômes ne tolèrent que les chasseurs respectueux : on ne les décroche pas, on
          ne les déplace pas, on ne les cache pas pour embêter les autres.
        </p>
        <p className="oath-sentence">{OATH_SENTENCE}</p>
        <div className="field">
          <label htmlFor="oath">Recopie cette phrase pour prêter serment</label>
          <input
            id="oath"
            type="text"
            value={oath}
            autoComplete="off"
            autoCapitalize="sentences"
            spellCheck={false}
            onChange={(event) => setOath(event.target.value)}
          />
          {oath.trim().length > 0 && !oathFulfilled && (
            <p className="field-hint">Pas tout à fait — recopie la phrase en entier.</p>
          )}
          {oathFulfilled && <p className="oath-done">Serment prêté. 🕯️</p>}
        </div>
      </div>

      {error && <p className="field-error">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
        {pending ? 'Un instant…' : "C'est parti !"}
      </button>
      <button type="button" className="btn-link" onClick={onBack}>
        Retour
      </button>
    </form>
  )
}

function ReturningPlayerForm({ onBack }: { onBack: () => void }) {
  const { signIn } = usePlayerContext()
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = isValidName(name) && isValidPin(pin) && !pending

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    setPending(true)
    setError(null)
    try {
      const docId = playerDocId(name, pin)
      const player = await fetchPlayer(docId)
      if (!player) {
        setError(
          "Aucune partie trouvée avec ce prénom et ce code. Vérifie les deux — ou reviens en arrière et choisis « Je commence ».",
        )
        setPending(false)
        return
      }
      signIn({ docId, player })
    } catch {
      setError(NETWORK_MESSAGE)
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <h1>Bon retour !</h1>
      <p className="muted">Redonne ton prénom et ton code, on récupère ta partie.</p>

      <div className="field">
        <label htmlFor="back-name">Ton prénom</label>
        <input
          id="back-name"
          type="text"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          autoComplete="given-name"
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="back-pin">Ton code à 4 chiffres</label>
        <input
          id="back-pin"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={pin}
          maxLength={4}
          autoComplete="off"
          onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))}
        />
      </div>

      {error && <p className="field-error">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
        {pending ? 'On cherche…' : 'Retrouver ma partie'}
      </button>
      <button type="button" className="btn-link" onClick={onBack}>
        Retour
      </button>
    </form>
  )
}
