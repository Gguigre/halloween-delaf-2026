import './FloatingGhost.css'

type Props = {
  size?: number
}

export function FloatingGhost({ size = 120 }: Props) {
  return (
    <svg
      className="floating-ghost"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Fantôme"
    >
      <path
        d="M50 8c-18 0-32 14-32 32v45c0 3 3 5 6 4l8-5c2-1 4-1 6 0l7 5c2 1 4 1 6 0l7-5c2-1 4-1 6 0l8 5c3 1 6-1 6-4V40c0-18-14-32-32-32z"
        fill="#f4ecff"
      />
      <ellipse cx="38" cy="42" rx="5.5" ry="7" fill="#12091c" />
      <ellipse cx="62" cy="42" rx="5.5" ry="7" fill="#12091c" />
      <ellipse cx="50" cy="60" rx="7" ry="9" fill="#12091c" />
    </svg>
  )
}
