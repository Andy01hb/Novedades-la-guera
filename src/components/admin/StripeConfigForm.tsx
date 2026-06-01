'use client'
import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Eye, EyeOff, Trash2, ExternalLink } from 'lucide-react'

interface StripeStatus {
  configured: boolean
  publicKeyHint: string | null
  secretKeyConfigured: boolean
  webhookConfigured: boolean
}

const inputClass = 'w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-xl text-white text-sm focus:border-pink outline-none transition-colors font-mono'
const labelClass = 'text-white text-sm font-semibold block mb-1'
const hintClass = 'text-admin-muted text-xs mt-1 leading-relaxed'

function FieldHelp({ step, title, hint }: { step: number; title: string; hint: string }) {
  return (
    <div className="flex gap-3 mb-3">
      <div className="w-6 h-6 rounded-full bg-pink/20 text-pink text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
        {step}
      </div>
      <div>
        <p className={labelClass}>{title}</p>
        <p className={hintClass}>{hint}</p>
      </div>
    </div>
  )
}

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
    fetch('/api/admin/stripe').then((r) => r.json()).then(setStatus)
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
      setError(data.error ?? 'Ocurrió un error. Verifica que las claves sean correctas.')
      return
    }

    setSuccess(true)
    setPublicKey('')
    setSecretKey('')
    setWebhookSecret('')
    const updated = await fetch('/api/admin/stripe').then((r) => r.json())
    setStatus(updated)
    setTimeout(() => setSuccess(false), 5000)
  }

  const handleDelete = async () => {
    if (!confirm('¿Desactivar los pagos? La tienda dejará de poder cobrar hasta que vuelvas a configurar las claves.')) return
    await fetch('/api/admin/stripe', { method: 'DELETE' })
    setStatus({ configured: false, publicKeyHint: null, secretKeyConfigured: false, webhookConfigured: false })
  }

  return (
    <div className="space-y-6">

      {/* Estado actual */}
      {status && (
        <div className={`flex items-start gap-3 p-4 rounded-2xl border ${
          status.configured
            ? 'bg-green-900/20 border-green-500/30'
            : 'bg-yellow-900/20 border-yellow-500/30'
        }`}>
          {status.configured
            ? <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
            : <AlertCircle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
          }
          <div className="flex-1">
            <p className={`text-sm font-semibold ${status.configured ? 'text-green-400' : 'text-yellow-400'}`}>
              {status.configured ? '✅ Pagos activados' : '⚠️ Pagos desactivados'}
            </p>
            <p className="text-admin-muted text-xs mt-0.5">
              {status.configured
                ? `Tu tienda está recibiendo pagos. Clave activa: ${status.publicKeyHint}`
                : 'Configura tus claves de Stripe para empezar a cobrar.'}
            </p>
          </div>
          {status.configured && (
            <button onClick={handleDelete} title="Desactivar pagos" className="text-admin-muted hover:text-red-400 transition-colors shrink-0">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}

      {/* Guía paso a paso */}
      <div className="bg-admin-bg rounded-2xl p-4 border border-admin-border space-y-1">
        <p className="text-white text-sm font-bold mb-3">¿Cómo obtener las claves?</p>
        <p className="text-admin-muted text-xs mb-3 leading-relaxed">
          Entra a tu cuenta de Stripe y busca la sección de <strong className="text-white">Developers → API keys</strong>.
          Ahí encontrarás las dos primeras claves.
        </p>
        <a
          href="https://dashboard.stripe.com/apikeys"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-pink text-xs hover:underline w-fit"
        >
          <ExternalLink size={12} />
          Abrir API keys en Stripe
        </a>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSave} className="space-y-5">

        <div>
          <FieldHelp
            step={1}
            title="Clave pública"
            hint='Es la clave que empieza con "pk_". Se usa para mostrar el formulario de pago a tus clientes. No es secreta.'
          />
          <input
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            className={inputClass}
            placeholder="pk_live_... o pk_test_..."
            required
          />
        </div>

        <div>
          <FieldHelp
            step={2}
            title="Clave secreta"
            hint='Es la clave que empieza con "sk_". Se usa para procesar los cobros. ¡Nunca la compartas con nadie!'
          />
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className={`${inputClass} pr-10`}
              placeholder="sk_live_... o sk_test_..."
              required
            />
            <button type="button" onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-muted hover:text-white transition-colors">
              {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <FieldHelp
            step={3}
            title="Clave de notificaciones de pago (Webhook)"
            hint='Permite que Stripe avise a tu tienda cuando alguien paga. Sin esto, los pedidos no se actualizan automáticamente. La encuentras en Stripe → Developers → Webhooks.'
          />
          <div className="relative">
            <input
              type={showWebhook ? 'text' : 'password'}
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              className={`${inputClass} pr-10`}
              placeholder="whsec_..."
              required
            />
            <button type="button" onClick={() => setShowWebhook(!showWebhook)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-muted hover:text-white transition-colors">
              {showWebhook ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <a
            href="https://dashboard.stripe.com/webhooks"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-pink text-xs hover:underline w-fit mt-2"
          >
            <ExternalLink size={12} />
            Abrir Webhooks en Stripe
          </a>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-xl">
            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-400 text-xs leading-relaxed">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-500/30 rounded-xl">
            <CheckCircle2 size={14} className="text-green-400 shrink-0" />
            <p className="text-green-400 text-xs">¡Listo! Tu tienda ya puede recibir pagos.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-pink text-white font-bold py-3 rounded-xl hover:bg-pink/90 transition-colors disabled:opacity-50 text-sm"
        >
          {saving ? 'Verificando que las claves sean correctas...' : 'Activar pagos'}
        </button>
      </form>
    </div>
  )
}
