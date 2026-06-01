'use client'
import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Eye, EyeOff, Trash2 } from 'lucide-react'

interface StripeStatus {
  configured: boolean
  publicKeyHint: string | null
  secretKeyConfigured: boolean
  webhookConfigured: boolean
}

const inputClass = 'w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-xl text-white text-sm focus:border-pink outline-none transition-colors font-mono'
const labelClass = 'text-admin-muted text-sm font-medium block mb-1.5'

export default function StripeConfigForm() {
  const [status, setStatus] = useState<StripeStatus | null>(null)
  const [publicKey, setPublicKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [showWebhook, setShowWebhook] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/admin/stripe')
      .then((r) => r.json())
      .then(setStatus)
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const res = await fetch('/api/admin/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey, secretKey, webhookSecret }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error ?? 'Error al guardar')
      return
    }

    setSuccess(true)
    setPublicKey('')
    setSecretKey('')
    setWebhookSecret('')
    const updated = await fetch('/api/admin/stripe').then((r) => r.json())
    setStatus(updated)
    setTimeout(() => setSuccess(false), 4000)
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar la configuración de Stripe? Los pagos dejarán de funcionar.')) return
    await fetch('/api/admin/stripe', { method: 'DELETE' })
    setStatus({ configured: false, publicKeyHint: null, secretKeyConfigured: false, webhookConfigured: false })
  }

  return (
    <div className="space-y-5">
      {status && (
        <div className={`flex items-center gap-3 p-3 rounded-2xl border ${
          status.configured
            ? 'bg-green-900/20 border-green-500/30'
            : 'bg-yellow-900/20 border-yellow-500/30'
        }`}>
          {status.configured
            ? <CheckCircle2 size={16} className="text-green-400 shrink-0" />
            : <AlertCircle size={16} className="text-yellow-400 shrink-0" />
          }
          <div className="flex-1">
            <p className={`text-sm font-medium ${status.configured ? 'text-green-400' : 'text-yellow-400'}`}>
              {status.configured ? 'Stripe configurado' : 'Stripe sin configurar — los pagos están desactivados'}
            </p>
            {status.publicKeyHint && (
              <p className="text-xs text-admin-muted mt-0.5 font-mono">{status.publicKeyHint}</p>
            )}
          </div>
          {status.configured && (
            <button onClick={handleDelete} className="text-admin-muted hover:text-red-400 transition-colors">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className={labelClass}>Publishable Key</label>
          <input
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            className={inputClass}
            placeholder="pk_live_..."
            required
          />
        </div>

        <div>
          <label className={labelClass}>Secret Key</label>
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className={`${inputClass} pr-10`}
              placeholder="sk_live_..."
              required
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-muted hover:text-white transition-colors"
            >
              {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Webhook Secret</label>
          <div className="relative">
            <input
              type={showWebhook ? 'text' : 'password'}
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              className={`${inputClass} pr-10`}
              placeholder="whsec_..."
              required
            />
            <button
              type="button"
              onClick={() => setShowWebhook(!showWebhook)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-muted hover:text-white transition-colors"
            >
              {showWebhook ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <p className="text-admin-muted text-xs mt-1">
            Obtenlo en Stripe Dashboard → Developers → Webhooks → tu endpoint
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-xl">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-500/30 rounded-xl">
            <CheckCircle2 size={14} className="text-green-400 shrink-0" />
            <p className="text-green-400 text-xs">Claves verificadas y guardadas correctamente</p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-pink text-white font-bold text-sm rounded-xl hover:bg-pink/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Verificando con Stripe...' : 'Verificar y guardar'}
        </button>
      </form>
    </div>
  )
}
