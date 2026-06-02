'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/store/cart'
import { CheckoutFormData } from '@/types'
import { DeliveryType } from '@prisma/client'
import StepPersonal from '@/components/checkout/StepPersonal'
import StepAddress from '@/components/checkout/StepAddress'
import StepPayment from '@/components/checkout/StepPayment'

const STEPS = ['Tus datos', 'Dirección y envío', 'Pago']

type PersonalData = Pick<CheckoutFormData, 'customerName' | 'customerPhone' | 'customerEmail'>
type AddressData = Omit<CheckoutFormData, 'customerName' | 'customerPhone' | 'customerEmail'>

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<Partial<CheckoutFormData>>({
    deliveryType: DeliveryType.LOCAL,
    deliveryCost: 0,
  })
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const deliveryCost = formData.deliveryCost ?? 0
  const total = subtotal() + deliveryCost

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)

  const handleStep1 = (data: PersonalData) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setStep(1)
  }

  const handleStep2 = async (data: AddressData) => {
    const merged = { ...formData, ...data } as CheckoutFormData
    setFormData(merged)
    setSubmitError(null)

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...merged,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
    })

    const json = await res.json()
    if (!res.ok) {
      setSubmitError(json.error ?? 'Error al procesar el pedido')
      return
    }

    setClientSecret(json.clientSecret)
    setOrderId(json.orderId)
    setStep(2)
  }

  const handlePaymentSuccess = () => {
    clearCart()
    router.push(`/confirmacion/${orderId}`)
  }

  if (items.length === 0 && step === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">&#128722;</p>
        <h1 className="text-2xl font-black text-dark mb-2">Tu carrito está vacío</h1>
        <p className="text-dark/50 mb-6">Agrega productos antes de continuar al pago</p>
        <a href="/productos" className="btn-primary inline-block">Ver catálogo</a>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                i <= step ? 'bg-pink text-white' : 'bg-dark/10 text-dark/40'
              }`}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span
              className={`text-sm font-medium hidden sm:block ${
                i <= step ? 'text-dark' : 'text-dark/40'
              }`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 ${i < step ? 'bg-pink' : 'bg-dark/10'}`} />
            )}
          </div>
        ))}
      </div>

      {submitError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm">
          {submitError}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Formulario */}
        <div className="flex-1">
          {step === 0 && (
            <StepPersonal onNext={handleStep1} defaultValues={formData} />
          )}
          {step === 1 && (
            <StepAddress
              onNext={handleStep2}
              onDeliveryCostChange={(cost) => setFormData(prev => ({ ...prev, deliveryCost: cost }))}
              defaultValues={formData}
            />
          )}
          {step === 2 && clientSecret && (
            <StepPayment clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
          )}
        </div>

        {/* Resumen sidebar */}
        <div className="lg:w-72">
          <div className="bg-white rounded-3xl p-5 shadow-sm sticky top-24">
            <h3 className="font-bold text-dark mb-3 text-sm">Resumen del pedido</h3>
            <div className="max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-xs text-dark/60 py-1.5 border-b border-dark/5"
                >
                  <span className="truncate mr-2">
                    {item.name} &times;{item.quantity}
                  </span>
                  <span className="shrink-0">{formatPrice(item.priceRetail * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-dark/60 py-2 mt-1">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal())}</span>
            </div>
            <div className="flex justify-between text-xs text-dark/60 pb-2 border-b border-dark/5">
              <span>Envío</span>
              <span>{deliveryCost === 0 ? 'Gratis' : formatPrice(deliveryCost)}</span>
            </div>
            <div className="flex justify-between font-black text-dark pt-3">
              <span>Total</span>
              <span className="text-pink">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
