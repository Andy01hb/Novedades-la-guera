'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Search, Menu, X, User, Package, LogOut, Settings } from 'lucide-react'
import { useCart } from '@/store/cart'
import { useSession, signOut } from 'next-auth/react'
import StoreLogo from '@/components/ui/StoreLogo'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/productos?cat=BELLEZA', label: 'Belleza' },
  { href: '/productos?cat=ACCESORIOS', label: 'Accesorios' },
  { href: '/productos?cat=HOGAR', label: 'Hogar' },
  { href: '/productos?cat=DULCERIA', label: 'Dulcería' },
  { href: '/productos?cat=NOVEDADES', label: 'Novedades' },
]

export default function Navbar({ logoUrl }: { logoUrl?: string | null }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const totalItems = useCart((s) => s.totalItems())
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <StoreLogo size={40} src={logoUrl} />
          <div className="hidden sm:block">
            <p className="font-black text-dark text-sm leading-none">Novedades</p>
            <p className="font-black text-pink text-sm leading-none">La Güera</p>
          </div>
        </Link>

        {/* Nav links desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-dark/70 hover:text-pink transition-colors rounded-lg hover:bg-pink/5"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/productos?badge=OFERTA"
            className="px-3 py-1.5 text-sm font-bold text-white bg-pink rounded-full ml-1 hover:bg-pink/90 transition-colors"
          >
            OFERTAS
          </Link>
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-pink/5 text-dark/70 hover:text-pink transition-colors">
            <Search size={20} />
          </button>

          <Link href="/carrito" className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-pink/5 text-dark/70 hover:text-pink transition-colors">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-yellow text-dark text-xs font-black rounded-full flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>

          {/* User menu */}
          <div className="relative">
            {session ? (
              <>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-9 h-9 rounded-full bg-pink/10 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-pink transition-all"
                >
                  {session.user?.image
                    ? <img src={session.user.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    : <User size={16} className="text-pink" />
                  }
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-lg border border-dark/5 py-2 z-50">
                    <p className="px-4 py-2 text-xs text-dark/40 truncate">{session.user?.name}</p>
                    <Link href="/cuenta/pedidos" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-dark hover:bg-pink/5 hover:text-pink transition-colors">
                      <Package size={15} /> Mis pedidos
                    </Link>
                    <Link href="/cuenta/perfil" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-dark hover:bg-pink/5 hover:text-pink transition-colors">
                      <Settings size={15} /> Mi perfil
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-dark/60 hover:bg-red-50 hover:text-red-500 transition-colors">
                      <LogOut size={15} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link href="/cuenta/login"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-dark/70 hover:text-pink transition-colors">
                <User size={16} /> Iniciar sesión
              </Link>
            )}
          </div>

          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-pink/5 text-dark hover:text-pink transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-dark/5 px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-2 px-3 text-sm font-medium text-dark/70 hover:text-pink rounded-lg hover:bg-pink/5"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
