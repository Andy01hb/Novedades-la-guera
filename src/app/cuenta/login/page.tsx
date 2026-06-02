'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const inputClass = 'w-full px-4 py-3 border border-gray-200 rounded-2xl text-dark text-sm focus:border-pink focus:outline-none transition-colors'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await signIn('credentials', {
      email, password, redirect: false,
      callbackUrl: returnTo,
    })
    setLoading(false)
    if (result?.error) {
      setError('Correo o contraseña incorrectos')
    } else {
      router.push(returnTo)
      router.refresh()
    }
  }

  const handleGoogle = () => {
    signIn('google', { callbackUrl: returnTo })
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-dark">Iniciar sesión</h1>
          <p className="text-dark/50 text-sm mt-1">Bienvenida de vuelta</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-2xl text-sm font-medium text-dark hover:bg-gray-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-dark/40 text-xs">o</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputClass}
              placeholder="tu@correo.com"
              required
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Contraseña"
              required
            />
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink text-white font-bold py-3 rounded-2xl hover:bg-pink/90 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-dark/50 text-xs">
            ¿No tienes cuenta?{' '}
            <Link href={`/cuenta/registro?returnTo=${encodeURIComponent(returnTo)}`} className="text-pink font-medium hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
