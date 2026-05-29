'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  customerName: z.string().min(2, 'Ingresa tu nombre completo'),
  customerPhone: z.string().min(10, 'Ingresa un teléfono válido (10 dígitos)'),
  customerEmail: z.string().email('Ingresa un correo válido'),
})

type FormData = z.infer<typeof schema>

interface Props {
  onNext: (data: FormData) => void
  defaultValues: Partial<FormData>
}

const inputClass =
  'w-full px-4 py-3 border-2 border-dark/10 rounded-2xl text-dark text-sm focus:border-pink outline-none transition-colors'

export default function StepPersonal({ onNext, defaultValues }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: defaultValues.customerName ?? '',
      customerPhone: defaultValues.customerPhone ?? '',
      customerEmail: defaultValues.customerEmail ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <h2 className="text-2xl font-black text-dark">Tus datos</h2>

      <div>
        <label className="text-sm font-medium text-dark/70 block mb-1.5">Nombre completo</label>
        <input {...register('customerName')} className={inputClass} placeholder="Tu nombre completo" />
        {errors.customerName && (
          <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-dark/70 block mb-1.5">Teléfono</label>
        <input
          {...register('customerPhone')}
          className={inputClass}
          placeholder="10 dígitos"
          type="tel"
        />
        {errors.customerPhone && (
          <p className="text-red-500 text-xs mt-1">{errors.customerPhone.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-dark/70 block mb-1.5">Correo electrónico</label>
        <input
          {...register('customerEmail')}
          className={inputClass}
          placeholder="correo@ejemplo.com"
          type="email"
        />
        {errors.customerEmail && (
          <p className="text-red-500 text-xs mt-1">{errors.customerEmail.message}</p>
        )}
      </div>

      <button type="submit" className="btn-primary w-full">
        Continuar &rarr;
      </button>
    </form>
  )
}
