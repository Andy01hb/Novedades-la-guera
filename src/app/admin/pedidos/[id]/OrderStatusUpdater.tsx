'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OrderStatus } from '@prisma/client'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: '🔵 Nuevo' },
  { value: 'PREPARING', label: '🟡 Preparando' },
  { value: 'SHIPPED', label: '🚀 Enviado' },
  { value: 'DELIVERED', label: '✅ Entregado' },
  { value: 'CANCELLED', label: '❌ Cancelado' },
]

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: OrderStatus
}) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        setSaved(true)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-admin-card border border-admin-border rounded-2xl p-5">
      <h2 className="text-white font-bold mb-3">Cambiar estado</h2>
      <select
        value={status}
        onChange={(e) => { setStatus(e.target.value as OrderStatus); setSaved(false) }}
        className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-xl text-white text-sm focus:border-pink outline-none mb-3"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        onClick={handleSave}
        disabled={saving || status === currentStatus}
        className="w-full bg-pink text-white font-bold py-2.5 rounded-xl text-sm hover:bg-pink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar estado'}
      </button>
    </div>
  )
}
