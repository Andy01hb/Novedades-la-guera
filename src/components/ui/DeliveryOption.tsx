import { DeliveryType, DELIVERY_COSTS, DELIVERY_LABELS } from '@/types'

const DELIVERY_DESCRIPTIONS: Record<DeliveryType, string> = {
  LOCAL:       'Mismo día en Juárez, N.L.',
  PAQUETERIA:  'República mexicana 3-5 días hábiles',
  RECOGER:     'Arturo B. de la Garza #108, Juárez N.L.',
}

interface DeliveryOptionProps {
  type: DeliveryType
  selected: boolean
  onSelect: (type: DeliveryType) => void
}

export default function DeliveryOption({ type, selected, onSelect }: DeliveryOptionProps) {
  const cost = DELIVERY_COSTS[type]
  const formatPrice = (cents: number) =>
    cents === 0
      ? 'Gratis'
      : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)

  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
        selected ? 'border-pink bg-pink/5' : 'border-dark/10 hover:border-pink/40'
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          selected ? 'border-pink' : 'border-dark/30'
        }`}
      >
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-pink" />}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-dark text-sm">{DELIVERY_LABELS[type]}</p>
        <p className="text-xs text-dark/50">{DELIVERY_DESCRIPTIONS[type]}</p>
      </div>
      <span className={`font-bold text-sm ${cost === 0 ? 'text-green-600' : 'text-dark'}`}>
        {formatPrice(cost)}
      </span>
    </button>
  )
}
