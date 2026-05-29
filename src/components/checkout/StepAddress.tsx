'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DeliveryType } from '@prisma/client'
import DeliveryOption from '@/components/ui/DeliveryOption'

const schema = z.object({
  street: z.string().min(3, 'Ingresa tu calle y número'),
  colonia: z.string().min(2, 'Ingresa tu colonia'),
  postalCode: z.string().length(5, 'El código postal tiene 5 dígitos'),
  city: z.string().min(2, 'Ingresa la ciudad'),
  state: z.string().min(2, 'Ingresa el estado'),
  references: z.string(),
  deliveryType: z.nativeEnum(DeliveryType),
})

type FormData = z.infer<typeof schema>

interface Props {
  onNext: (data: FormData) => void
  defaultValues: Partial<FormData>
}

const inputClass =
  'w-full px-4 py-3 border-2 border-dark/10 rounded-2xl text-dark text-sm focus:border-pink outline-none transition-colors'

export default function StepAddress({ onNext, defaultValues }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      street: defaultValues.street ?? '',
      colonia: defaultValues.colonia ?? '',
      postalCode: defaultValues.postalCode ?? '',
      city: defaultValues.city ?? 'Juárez',
      state: defaultValues.state ?? 'Nuevo León',
      references: defaultValues.references ?? '',
      deliveryType: defaultValues.deliveryType ?? DeliveryType.LOCAL,
    },
  })

  const selectedDelivery = watch('deliveryType')

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <h2 className="text-2xl font-black text-dark">Dirección de entrega</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-sm font-medium text-dark/70 block mb-1.5">Calle y número</label>
          <input {...register('street')} className={inputClass} placeholder="Calle Principal #123" />
          {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-dark/70 block mb-1.5">Colonia</label>
          <input {...register('colonia')} className={inputClass} placeholder="Colonia" />
          {errors.colonia && <p className="text-red-500 text-xs mt-1">{errors.colonia.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-dark/70 block mb-1.5">Código postal</label>
          <input
            {...register('postalCode')}
            className={inputClass}
            placeholder="67000"
            maxLength={5}
          />
          {errors.postalCode && (
            <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-dark/70 block mb-1.5">Ciudad</label>
          <input {...register('city')} className={inputClass} />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-dark/70 block mb-1.5">Estado</label>
          <input {...register('state')} className={inputClass} />
          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
        </div>

        <div className="col-span-2">
          <label className="text-sm font-medium text-dark/70 block mb-1.5">
            Referencias <span className="text-dark/30">(opcional)</span>
          </label>
          <input
            {...register('references')}
            className={inputClass}
            placeholder="Entre calles, color de casa..."
          />
        </div>
      </div>

      {/* Opciones de envío */}
      <div>
        <h3 className="font-bold text-dark mb-3">Tipo de envío</h3>
        <div className="space-y-2">
          {Object.values(DeliveryType).map((type) => (
            <DeliveryOption
              key={type}
              type={type}
              selected={selectedDelivery === type}
              onSelect={(t) => setValue('deliveryType', t)}
            />
          ))}
        </div>
      </div>

      <button type="submit" className="btn-primary w-full">
        Continuar al pago &rarr;
      </button>
    </form>
  )
}
