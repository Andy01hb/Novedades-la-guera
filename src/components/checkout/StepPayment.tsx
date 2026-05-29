'use client'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/confirmacion/stripe`,
      },
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Error al procesar el pago')
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-2xl font-black text-dark">Pago seguro</h2>

      <div className="bg-white border-2 border-dark/10 rounded-2xl p-4">
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-dark/40">
        <span>&#128274;</span>
        <span>Tu información está protegida con cifrado SSL de 256 bits</span>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Procesando...
          </>
        ) : (
          <span>&#128274; Pagar con Stripe</span>
        )}
      </button>
    </form>
  )
}

export default function StepPayment({
  clientSecret,
  onSuccess,
}: {
  clientSecret: string
  onSuccess: () => void
}) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, locale: 'es-419' }}>
      <PaymentForm onSuccess={onSuccess} />
    </Elements>
  )
}
