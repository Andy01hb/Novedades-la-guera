'use client'

interface CategoryChipProps {
  label: string
  active: boolean
  onClick: () => void
  color?: string
}

export default function CategoryChip({ label, active, onClick, color }: CategoryChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
        active
          ? 'bg-pink text-white shadow-pink'
          : 'bg-white text-dark border border-dark/10 hover:border-pink hover:text-pink'
      }`}
      style={active && color ? { backgroundColor: color } : undefined}
    >
      {label}
    </button>
  )
}
