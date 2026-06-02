'use client'
import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DeliveryType } from '@prisma/client'
import { DELIVERY_COSTS } from '@/types'
import AddressPicker, { type AddressDetails } from '@/components/ui/AddressPicker'
import { Loader2, Truck, Package, Store, MapPin } from 'lucide-react'

const schema = z.object({
  street:       z.string().min(3, 'Ingresa tu calle y número'),
  colonia:      z.string().min(2, 'Ingresa tu colonia'),
  postalCode:   z.string().length(5, 'El código postal tiene 5 dígitos'),
  city:         z.string().min(2, 'Ingresa la ciudad'),
  state:        z.string().min(2, 'Ingresa el estado'),
  references:   z.string(),
  deliveryType: z.nativeEnum(DeliveryType),
  deliveryCost: z.number().int().min(0),
})

type FormData = z.infer<typeof schema>

interface ShippingEstimate { cost: number; label: string; km: number }

interface Props {
  onNext: (data: FormData) => void
  onDeliveryCostChange: (cost: number) => void
  defaultValues: Partial<FormData>
}

const inputClass =
  'w-full px-4 py-3 border-2 border-dark/10 rounded-2xl text-dark text-sm focus:border-pink outline-none transition-colors'
const labelClass = 'text-sm font-medium text-dark/70 block mb-1.5'

function formatMXN(cents: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)
}

export default function StepAddress({ onNext, onDeliveryCostChange, defaultValues }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      street:       defaultValues.street ?? '',
      colonia:      defaultValues.colonia ?? '',
      postalCode:   defaultValues.postalCode ?? '',
      city:         defaultValues.city ?? '',
      state:        defaultValues.state ?? '',
      references:   defaultValues.references ?? '',
      deliveryType: defaultValues.deliveryType ?? DeliveryType.LOCAL,
      deliveryCost: defaultValues.deliveryCost ?? 0,
    },
  })

  const selectedType = watch('deliveryType')
  const [pickerAddress, setPickerAddress] = useState('')
  const [estimate, setEstimate] = useState<ShippingEstimate | null>(null)
  const [estimating, setEstimating] = useState(false)
  const [estimateError, setEstimateError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Notify parent when delivery cost changes
  useEffect(() => {
    const cost = selectedType === DeliveryType.LOCAL
      ? (estimate?.cost ?? 0)
      : DELIVERY_COSTS[selectedType]
    setValue('deliveryCost', cost)
    onDeliveryCostChange(cost)
  }, [selectedType, estimate]) // eslint-disable-line react-hooks/exhaustive-deps

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
        setValue('deliveryType', DeliveryType.LOCAL)
      } else {
        setEstimateError(data.error ?? 'No hay envío disponible para esta dirección')
        if (selectedType === DeliveryType.LOCAL) setValue('deliveryType', DeliveryType.RECOGER)
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
    // Trigger estimate immediately on confirmed address
    runEstimate(details.address)
  }

  // Debounced re-estimate when city changes manually
  const city = watch('city')
  const street = watch('street')
  useEffect(() => {
    if (!city || !street || pickerAddress) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const manual = [street, city, watch('state')].filter(Boolean).join(', ')
      runEstimate(manual)
    }, 1200)
  }, [city, street]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectType = (type: DeliveryType) => {
    setValue('deliveryType', type)
    const cost = type === DeliveryType.LOCAL ? (estimate?.cost ?? 0) : DELIVERY_COSTS[type]
    setValue('deliveryCost', cost)
    onDeliveryCostChange(cost)
  }

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <h2 className="text-2xl font-black text-dark">Dirección de entrega</h2>

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
        <p className="text-dark/40 text-xs mt-1.5">Selecciona una sugerencia para auto-llenar los campos y calcular el envío</p>
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

      {/* Delivery options */}
      <div>
        <h3 className="font-bold text-dark mb-3">Tipo de envío</h3>
        <div className="space-y-2">

          {/* Local — dynamic */}
          <button type="button" onClick={() => selectType(DeliveryType.LOCAL)}
            disabled={!estimate && !estimating}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
              selectedType === DeliveryType.LOCAL && estimate
                ? 'border-pink bg-pink/5'
                : 'border-dark/10 hover:border-pink/40 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedType === DeliveryType.LOCAL && estimate ? 'border-pink' : 'border-dark/30'}`}>
              {selectedType === DeliveryType.LOCAL && estimate && <div className="w-2.5 h-2.5 rounded-full bg-pink" />}
            </div>
            <Truck size={18} className={selectedType === DeliveryType.LOCAL ? 'text-pink' : 'text-dark/40'} />
            <div className="flex-1">
              <p className="font-semibold text-dark text-sm">Entrega a domicilio</p>
              {estimating ? (
                <p className="text-xs text-dark/40 flex items-center gap-1"><Loader2 size={11} className="animate-spin" /> Calculando...</p>
              ) : estimate ? (
                <p className="text-xs text-dark/50">{estimate.label} · {estimate.km} km</p>
              ) : estimateError ? (
                <p className="text-xs text-red-400">{estimateError}</p>
              ) : (
                <p className="text-xs text-dark/40">Ingresa tu dirección para ver el costo</p>
              )}
            </div>
            <span className={`font-bold text-sm shrink-0 ${estimate ? 'text-dark' : 'text-dark/30'}`}>
              {estimating ? '...' : estimate ? formatMXN(estimate.cost) : '—'}
            </span>
          </button>

          {/* Pickup */}
          <button type="button" onClick={() => selectType(DeliveryType.RECOGER)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${selectedType === DeliveryType.RECOGER ? 'border-pink bg-pink/5' : 'border-dark/10 hover:border-pink/40'}`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedType === DeliveryType.RECOGER ? 'border-pink' : 'border-dark/30'}`}>
              {selectedType === DeliveryType.RECOGER && <div className="w-2.5 h-2.5 rounded-full bg-pink" />}
            </div>
            <Store size={18} className={selectedType === DeliveryType.RECOGER ? 'text-pink' : 'text-dark/40'} />
            <div className="flex-1">
              <p className="font-semibold text-dark text-sm">Recoger en tienda</p>
              <p className="text-xs text-dark/50">Arturo B. de la Garza #108, Juárez</p>
            </div>
            <span className="font-bold text-sm text-green-600">Gratis</span>
          </button>

          {/* National shipping */}
          <button type="button" onClick={() => selectType(DeliveryType.PAQUETERIA)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${selectedType === DeliveryType.PAQUETERIA ? 'border-pink bg-pink/5' : 'border-dark/10 hover:border-pink/40'}`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedType === DeliveryType.PAQUETERIA ? 'border-pink' : 'border-dark/30'}`}>
              {selectedType === DeliveryType.PAQUETERIA && <div className="w-2.5 h-2.5 rounded-full bg-pink" />}
            </div>
            <Package size={18} className={selectedType === DeliveryType.PAQUETERIA ? 'text-pink' : 'text-dark/40'} />
            <div className="flex-1">
              <p className="font-semibold text-dark text-sm">Paquetería nacional</p>
              <p className="text-xs text-dark/50">República mexicana · 3-5 días hábiles</p>
            </div>
            <span className="font-bold text-sm text-dark">{formatMXN(DELIVERY_COSTS[DeliveryType.PAQUETERIA])}</span>
          </button>

        </div>
        {errors.deliveryType && <p className="text-red-500 text-xs mt-2">{errors.deliveryType.message}</p>}
      </div>

      <button type="submit" className="btn-primary w-full">
        Continuar al pago &rarr;
      </button>
    </form>
  )
}
