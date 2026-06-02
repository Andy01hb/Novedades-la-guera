'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { CheckCircle2, Package, LogOut } from 'lucide-react'
import AddressPicker, { type AddressDetails } from '@/components/ui/AddressPicker'

interface Profile {
  name: string; email: string; phone: string | null
  street: string | null; colonia: string | null; postalCode: string | null
  city: string | null; state: string | null; provider: string | null
}

const inputClass = 'w-full px-4 py-3 border border-gray-200 rounded-2xl text-dark text-sm focus:border-pink focus:outline-none transition-colors'
const labelClass = 'text-dark/60 text-xs font-medium block mb-1'

function profileToAddress(p: Profile): string {
  const parts = [p.street, p.colonia, p.city, p.state].filter(Boolean)
  return parts.join(', ')
}

export default function PerfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/cuenta/login?returnTo=/cuenta/perfil')
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetch('/api/customer/profile').then(r => r.json()).then(setProfile)
    }
  }, [session])

  const handleAddressDetails = (details: AddressDetails) => {
    if (!profile) return
    setProfile({
      ...profile,
      street: details.street ?? profile.street,
      colonia: details.colonia ?? profile.colonia,
      postalCode: details.postalCode ?? profile.postalCode,
      city: details.city ?? profile.city,
      state: details.state ?? profile.state,
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true); setError(null); setSuccess(false)
    const res = await fetch('/api/customer/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    setSaving(false)
    if (res.ok) { setSuccess(true); setTimeout(() => setSuccess(false), 3000) }
    else setError('Error al guardar. Intenta de nuevo.')
  }

  if (!profile) return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <div className="w-8 h-8 border-2 border-pink border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-dark">Mi perfil</h1>
          <p className="text-dark/50 text-sm mt-1">{profile.email}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/cuenta/pedidos" className="flex items-center gap-1.5 px-3 py-2 text-sm text-dark/60 hover:text-pink rounded-xl hover:bg-pink/5 transition-colors">
            <Package size={15} /> Pedidos
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-1.5 px-3 py-2 text-sm text-dark/60 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors">
            <LogOut size={15} /> Salir
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Datos personales */}
        <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
          <p className="text-dark font-bold text-sm">Datos personales</p>
          <div>
            <label className={labelClass}>Nombre completo</label>
            <input value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Teléfono</label>
            <input value={profile.phone ?? ''}
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
              className={inputClass} placeholder="10 dígitos" />
          </div>
        </div>

        {/* Dirección de entrega */}
        <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <p className="text-dark font-bold text-sm">Dirección de entrega</p>
            <p className="text-dark/50 text-xs mt-0.5">Se usará para pre-llenar el formulario al hacer un pedido</p>
          </div>

          {/* Address picker — auto-fills fields below */}
          <div>
            <label className={labelClass}>Buscar con Google Maps</label>
            <AddressPicker
              value={profileToAddress(profile)}
              onChange={() => {}}
              onAddressDetails={handleAddressDetails}
              placeholder="Escribe o usa tu ubicación actual..."
              theme="light"
            />
            <p className="text-dark/40 text-xs mt-1.5">Al seleccionar una sugerencia, los campos de abajo se llenan automáticamente</p>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-dark/50 text-xs font-medium uppercase tracking-wide">Verifica o ajusta los datos</p>
            <div>
              <label className={labelClass}>Calle y número</label>
              <input value={profile.street ?? ''}
                onChange={e => setProfile({ ...profile, street: e.target.value })}
                className={inputClass} placeholder="Av. Juárez 123" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Colonia</label>
                <input value={profile.colonia ?? ''}
                  onChange={e => setProfile({ ...profile, colonia: e.target.value })}
                  className={inputClass} placeholder="Centro" />
              </div>
              <div>
                <label className={labelClass}>Código postal</label>
                <input value={profile.postalCode ?? ''}
                  onChange={e => setProfile({ ...profile, postalCode: e.target.value })}
                  className={inputClass} placeholder="44100" maxLength={5} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Ciudad</label>
                <input value={profile.city ?? ''}
                  onChange={e => setProfile({ ...profile, city: e.target.value })}
                  className={inputClass} placeholder="Ciudad Juárez" />
              </div>
              <div>
                <label className={labelClass}>Estado</label>
                <input value={profile.state ?? ''}
                  onChange={e => setProfile({ ...profile, state: e.target.value })}
                  className={inputClass} placeholder="Chihuahua" />
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

        <button type="submit" disabled={saving}
          className="w-full bg-pink text-white font-bold py-3 rounded-2xl hover:bg-pink/90 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2">
          {success ? <><CheckCircle2 size={16} /> Guardado</> : saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
