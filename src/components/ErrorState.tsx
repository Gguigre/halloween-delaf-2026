type Props = {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  pending?: boolean
}

export function ErrorState({
  title = 'Bouh ! Ça a raté',
  message,
  onRetry,
  retryLabel = 'Réessayer',
  pending = false,
}: Props) {
  return (
    <div className="card card-danger">
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-primary" onClick={onRetry} disabled={pending}>
          {pending ? 'Un instant…' : retryLabel}
        </button>
      )}
    </div>
  )
}
