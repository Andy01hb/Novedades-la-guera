'use client'
import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DeliveryType } from '@prisma/client'
import AddressPicker, { type AddressDetails } from '@/components/ui/AddressPicker'
import { Loader2, Truck, Store, MapPin, ArrowLeft, AlertCircle } from 'lucide-react'

const schema = z.object({
  deliveryType: z.nativeEnum(DeliveryType),
  deliveryCost: z.number().int().min(0),
  street:       z.string(),
  colonia:      z.string(),
  postalCode:   z.string(),
  city:         z.string(),
  state:        z.string(),
  references:   z.string(),
}).superRefine((data, ctx) => {
  if (data.deliveryType === DeliveryType.LOCAL) {
    if (data.street.length < 3)    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ingresa tu calle y número', path: ['street'] })
    if (data.colonia.length < 2)   ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ingresa tu colonia', path: ['colonia'] })
    if (data.postalCode.length !== 5) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El código postal tiene 5 dígitos', path: ['postalCode'] })
    if (data.city.length < 2)      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ingresa la ciudad', path: ['city'] })
    if (data.state.length < 2)     ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ingresa el estado', path: ['state'] })
  }
})

type FormData = z.infer<typeof schema>
type Phase = 'select' | 'address'

interface ShippingEstimate { cost: number; label: string; km: number }

interface Props {
  onNext: (data: FormData) => void
  onDeliveryCostChange: (cost: number) => void
  defaultValues: Partial<FormData>
}

const inputClass = 'w-full px-4 py-3 border-2 border-dark/10 rounded-2xl text-dark text-sm focus:border-pink outline-none transition-colors'
const labelClass  = 'text-sm font-medium text-dark/70 block mb-1.5'

function formatMXN(cents: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)
}

export default function StepAddress({ onNext, onDeliveryCostChange, defaultValues }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      deliveryType: defaultValues.deliveryType ?? DeliveryType.RECOGER,
      deliveryCost: defaultValues.deliveryCost ?? 0,
      street:       defaultValues.street ?? '',
      colonia:      defaultValues.colonia ?? '',
      postalCode:   defaultValues.postalCode ?? '',
      city:         defaultValues.city ?? '',
      state:        defaultValues.state ?? '',
      references:   defaultValues.references ?? '',
    },
  })

  const [phase, setPhase] = useState<Phase>('select')
  const [pickerAddress, setPickerAddress] = useState('')
  const [estimate, setEstimate] = useState<ShippingEstimate | null>(null)
  const [estimating, setEstimating] = useState(false)
  const [estimateError, setEstimateError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedType = watch('deliveryType')

  const runEstimate = async (address: string) => {
    if (!address || address.length < 8) return
    setEstimating(true)
    setEstimate(null)
    setEstimateError(null)
    try {
      const res = await fetch(`/api/shipping/estimate?address=${encodeURIComponent(address)}`)
      const data = await res.json()
      if (res.ok) {
        setEstimate(data)
        setValue('deliveryCost', data.cost)
        onDeliveryCostChange(data.cost)
      } else {
        setEstimateError(data.error ?? 'No hay envío disponible para esta dirección')
        setValue('deliveryCost', 0)
        onDeliveryCostChange(0)
      }
    } catch {
      setEstimateError('No se pudo calcular el envío')
    } finally {
      setEstimating(false)
    }
  }

  const handleAddressDetails = (details: AddressDetails) => {
    if (details.street)     setValue('street', details.street)
    if (details.colonia)    setValue('colonia', details.colonia)
    if (details.postalCode) setValue('postalCode', details.postalCode)
    if (details.city)       setValue('city', details.city)
    if (details.state)      setValue('state', details.state)
    runEstimate(details.address)
  }

  // Debounced estimate when manual fields change (without picker)
  const city   = watch('city')
  const street = watch('street')
  useEffect(() => {
    if (phase !== 'address' || !city || !street || pickerAddress) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const manual = [street, city, watch('state')].filter(Boolean).join(', ')
      runEstimate(manual)
    }, 1200)
  }, [city, street]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Phase: select ─────────────────────────────────────────────────────────
  if (phase === 'select') {
    const handleSelectRecoger = () => {
      onDeliveryCostChange(0)
      onNext({
        deliveryType: DeliveryType.RECOGER,
        deliveryCost: 0,
        street: '',
        colonia: '',
        postalCode: '',
        city: '',
        state: '',
        references: '',
      })
    }

    const handleSelectDomicilio = () => {
      setValue('deliveryType', DeliveryType.LOCAL)
      setValue('deliveryCost', 0)
      onDeliveryCostChange(0)
      setPhase('address')
    }

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-dark">¿Cómo recibirás tu pedido?</h2>

        <div className="space-y-3">
          {/* Recoger */}
          <button type="button" onClick={handleSelectRecoger}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-dark/10 text-left hover:border-pink/50 hover:bg-pink/5 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
              <Store size={22} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-dark text-base">Recoger en tienda</p>
              <p className="text-sm text-dark/50 mt-0.5">Arturo B. de la Garza #108, Juárez · Gratis</p>
            </div>
            <span className="font-black text-green-600 text-lg shrink-0">Gratis</span>
          </button>

          {/* Domicilio */}
          <button type="button" onClick={handleSelectDomicilio}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-dark/10 text-left hover:border-pink/50 hover:bg-pink/5 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-pink/10 flex items-center justify-center shrink-0">
              <Truck size={22} className="text-pink" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-dark text-base">Entrega a domicilio</p>
              <p className="text-sm text-dark/50 mt-0.5">Ingresa tu dirección para ver disponibilidad y costo</p>
            </div>
            <span className="text-dark/30 shrink-0">→</span>
          </button>
        </div>
      </div>
    )
  }

  // ── Phase: address ─────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => { setPhase('select'); setEstimate(null); setEstimateError(null) }}
          className="w-9 h-9 rounded-xl border-2 border-dark/10 flex items-center justify-center hover:border-pink transition-colors">
          <ArrowLeft size={16} className="text-dark/50" />
        </button>
        <h2 className="text-2xl font-black text-dark">Entrega a domicilio</h2>
      </div>

      {/* Address picker */}
      <div>
        <label className={labelClass}>
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-pink" /> Buscar con Google Maps</span>
        </label>
        <AddressPicker
          value={pickerAddress}
          onChange={setPickerAddress}
          onAddressDetails={handleAddressDetails}
          placeholder="Escribe tu dirección o usa tu ubicación..."
          theme="light"
        />
        <p className="text-dark/40 text-xs mt-1.5">Selecciona una sugerencia para auto-llenar los campos y calcular el costo</p>
      </div>

      {/* Manual fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Calle y número</label>
          <input {...register('street')} className={inputClass} placeholder="Calle Principal #123" />
          {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Colonia</label>
          <input {...register('colonia')} className={inputClass} placeholder="Colonia" />
          {errors.colonia && <p className="text-red-500 text-xs mt-1">{errors.colonia.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Código postal</label>
          <input {...register('postalCode')} className={inputClass} placeholder="67000" maxLength={5} />
          {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Ciudad</label>
          <input {...register('city')} className={inputClass} />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Estado</label>
          <input {...register('state')} className={inputClass} />
          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Referencias <span className="text-dark/30">(opcional)</span></label>
          <input {...register('references')} className={inputClass} placeholder="Entre calles, color de casa..." />
        </div>
      </div>

      {/* Shipping estimate result */}
      {estimating && (
        <div className="flex items-center gap-2 p-4 rounded-2xl border-2 border-dark/10 text-dark/50 text-sm">
          <Loader2 size={16} className="animate-spin text-pink" />
          Calculando costo de envío...
        </div>
      )}

      {!estimating && estimate && (
        <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-green-200 bg-green-50">
          <div className="flex items-center gap-3">
            <Truck size={18} className="text-green-600" />
            <div>
              <p className="font-semibold text-dark text-sm">{estimate.label}</p>
              <p className="text-xs text-dark/50">{estimate.km} km desde la tienda</p>
            </div>
          </div>
          <span className="font-black text-green-700 text-base">{formatMXN(estimate.cost)}</span>
        </div>
      )}

      {!estimating && estimateError && (
        <div className="p-4 rounded-2xl border-2 border-red-200 bg-red-50 space-y-2">
          <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
            <AlertCircle size={16} /> {estimateError}
          </div>
          <p className="text-xs text-dark/50">
            No hay envío disponible para esta dirección.{' '}
            <button type="button" onClick={() => { setPhase('select'); setEstimate(null); setEstimateError(null) }}
              className="text-pink font-semibold underline">
              ¿Quieres recoger en la tienda?
            </button>
          </p>
        </div>
      )}

      <button type="submit" disabled={estimating || (!estimate && !estimateError && selectedType === DeliveryType.LOCAL)}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
        {estimating ? 'Calculando envío...' : 'Continuar al pago →'}
      </button>
    </form>
  )
}
