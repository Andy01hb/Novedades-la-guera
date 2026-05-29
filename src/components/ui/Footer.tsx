import Link from 'next/link'
import { Share2, Globe } from 'lucide-react'
import StoreLogo from '@/components/ui/StoreLogo'

interface FooterProps {
  logoUrl?: string | null
}

const STORE_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Catálogo' },
  { href: '/productos?badge=OFERTA', label: 'Ofertas' },
  { href: '/productos?mayoreo=true', label: 'Mayoreo' },
]

const HELP_LINKS = [
  { href: '/seguimiento', label: 'Rastrear pedido' },
  { href: '/privacidad', label: 'Política de privacidad' },
  { href: '/terminos', label: 'Términos de uso' },
]

export default function Footer({ logoUrl }: FooterProps = {}) {
  return (
    <footer className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Columna 1: Marca + Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <StoreLogo size={40} src={logoUrl} />
              <div>
                <p className="font-black text-sm leading-none">Novedades</p>
                <p className="font-black text-pink text-sm leading-none">La Güera</p>
              </div>
            </div>
            <p className="text-dark-muted text-sm mb-4">
              ¡Todo lo que necesitas, al mejor precio! Belleza, accesorios, hogar, dulcería y más.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Tu correo"
                className="flex-1 px-3 py-2 rounded-lg bg-dark-card text-white text-sm border border-dark-border focus:border-pink outline-none"
              />
              <button className="btn-primary py-2 px-4 text-sm rounded-lg">
                Suscribir
              </button>
            </div>
          </div>

          {/* Columna 2: Tienda */}
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wide">Tienda</h4>
            <ul className="space-y-2">
              {STORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-dark-muted text-sm hover:text-pink transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Ayuda */}
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wide">Ayuda</h4>
            <ul className="space-y-2">
              {HELP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-dark-muted text-sm hover:text-pink transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wide">Contacto</h4>
            <address className="not-italic text-dark-muted text-sm space-y-2">
              <p>📍 Arturo B. de la Garza #108</p>
              <p>Juárez, Nuevo León</p>
              <p className="mt-3">🕐 Lun–Vie 9am–7pm</p>
              <p>Sáb 9am–4pm</p>
              <p className="text-pink font-medium">Pedidos online 24/7</p>
            </address>
            <div className="flex gap-3 mt-4">
              <a
                href="https://instagram.com/novedadeslagueraa"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 bg-dark-card rounded-full flex items-center justify-center text-dark-muted hover:text-pink transition-colors"
              >
                <Share2 size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 bg-dark-card rounded-full flex items-center justify-center text-dark-muted hover:text-pink transition-colors"
              >
                <Globe size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-dark-border px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-dark-muted">
          <p>© 2026 Novedades La Güera. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>Pagos seguros con</span>
            <span className="font-bold text-white">Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
