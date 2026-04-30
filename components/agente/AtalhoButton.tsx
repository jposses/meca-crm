'use client'

interface AtalhoButtonProps {
  label: string
  onClick: () => void
  disabled: boolean
}

export function AtalhoButton({ label, onClick, disabled }: AtalhoButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
      style={{
        background: 'rgba(0,201,119,0.12)',
        color: '#00C977',
        border: '1px solid rgba(0,201,119,0.25)',
      }}
    >
      {label}
    </button>
  )
}
