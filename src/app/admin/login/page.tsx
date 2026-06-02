'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import StoreLogo from '@/components/ui/StoreLogo'

async function adminSignIn(email: string, password: string): Promise<boolean> {
  const csrfRes = await fetch('/api/auth/csrf')
  const { csrfToken } = await csrfRes.json()

  const params = new URLSearchParams({
    email,
    password,
    csrfToken,
    callbackUrl: window.location.origin + '/admin/dashboard',
    json: 'true',
  })

  const res = await fetch('/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!res.ok) return false
  const data = await res.json()
  return !!data.url && !data.url.includes('error=')
}

function AdminLoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const ok = await adminSignIn(email, password)
      if (ok) {
        window.location.href = '/admin/dashboard'
      } else {
        setError('Correo o contraseña incorrectos')
      }
    } catch {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-admin-card rounded-3xl p-6 border border-admin-border">
      <div className="space-y-4">
        <div>
          <label className="text-admin-muted text-sm font-medium block mb-1.5">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-2xl text-white text-sm focus:border-pink outline-none transition-colors"
            placeholder="admin@novedadeslagueraa.com"
            required
          />
        </div>

        <div>
          <label className="text-admin-muted text-sm font-medium block mb-1.5">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-2xl text-white text-sm focus:border-pink outline-none transition-colors"
            placeholder="••••••••"
            required
            autoFocus={!!searchParams.get('email')}
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink text-white font-bold py-3 rounded-2xl hover:bg-pink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Entrando...' : 'Entrar al panel'}
        </button>
      </div>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 w-fit">
            <StoreLogo size={64} />
          </div>
          <h1 className="text-white font-black text-2xl">Panel Admin</h1>
          <p className="text-admin-muted text-sm mt-1">Novedades La Güera</p>
        </div>

        <Suspense fallback={<div className="bg-admin-card rounded-3xl p-6 border border-admin-border h-48" />}>
          <AdminLoginForm />
        </Suspense>

        <p className="text-center text-admin-muted text-xs mt-4">
          <a href="/" className="hover:text-white transition-colors">← Volver a la tienda</a>
        </p>
      </div>
    </div>
  )
}
