'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/admin/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink to-[#FF6BB3] flex items-center justify-center text-white font-black text-xl mx-auto mb-3">
            LG
          </div>
          <h1 className="text-white font-black text-2xl">Panel Admin</h1>
          <p className="text-admin-muted text-sm mt-1">Novedades La Güera</p>
        </div>

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

        <p className="text-center text-admin-muted text-xs mt-4">
          <a href="/" className="hover:text-white transition-colors">← Volver a la tienda</a>
        </p>
      </div>
    </div>
  )
}
