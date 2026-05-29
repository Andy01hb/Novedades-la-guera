'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LogOut, ExternalLink } from 'lucide-react'
import { NAV_ITEMS } from './nav-items'
import StoreLogo from '@/components/ui/StoreLogo'

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-52 bg-admin-card border-r border-admin-border min-h-screen fixed top-0 left-0">
      {/* Logo */}
      <div className="p-5 border-b border-admin-border">
        <div className="flex items-center gap-2">
          <StoreLogo size={32} />
          <div>
            <p className="text-white font-bold text-xs leading-none">La Güera</p>
            <p className="text-admin-muted text-xs">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-pink/10 text-pink'
                  : 'text-admin-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-admin-border space-y-1">
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-admin-muted hover:text-white hover:bg-white/5 transition-colors"
        >
          <ExternalLink size={18} />
          Ver tienda
        </a>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-admin-muted hover:text-red-400 hover:bg-red-400/5 transition-colors"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
