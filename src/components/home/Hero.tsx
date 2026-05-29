import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream py-10 lg:py-20">
      {/* Blobs decorativos */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-8">
        {/* Texto */}
        <div className="flex-1 text-center lg:text-left">
          <span className="inline-block px-4 py-1.5 bg-pink/10 text-pink font-semibold text-sm rounded-full mb-4">
            ✨ Colección Primavera 2026
          </span>
          <h1 className="text-4xl lg:text-6xl font-black text-dark leading-tight mb-4">
            Todo lo que <span className="text-pink">necesitas</span>,<br />
            al mejor precio
          </h1>
          <p className="text-dark/60 text-lg mb-8 max-w-md mx-auto lg:mx-0">
            Belleza, accesorios, hogar, dulcería y novedades. Entrega en Juárez y toda la república.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link href="/productos" className="btn-primary text-center">
              Ver catálogo
            </Link>
            <Link href="/productos?mayoreo=true" className="btn-ghost text-center">
              Precios mayoreo
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-8 justify-center lg:justify-start">
            <div className="text-center">
              <p className="text-2xl font-black text-pink">500+</p>
              <p className="text-xs text-dark/50">Productos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-pink">1K+</p>
              <p className="text-xs text-dark/50">Clientes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-pink">4.9★</p>
              <p className="text-xs text-dark/50">Calificación</p>
            </div>
          </div>
        </div>

        {/* Mascota placeholder + badges flotantes */}
        <div className="relative flex-1 flex items-center justify-center">
          <div className="w-64 h-64 lg:w-80 lg:h-80 bg-gradient-to-br from-pink/20 to-yellow/20 rounded-full flex items-center justify-center">
            <span className="text-8xl">👱‍♀️</span>
          </div>
          {/* Badges flotantes */}
          <div className="absolute top-4 right-8 bg-white rounded-2xl shadow-pink px-3 py-2 text-xs font-bold text-dark">
            🚀 Envío express
          </div>
          <div className="absolute bottom-8 left-4 bg-dark text-white rounded-2xl px-3 py-2 text-xs font-bold">
            💳 Pago con Stripe
          </div>
          <div className="absolute bottom-16 right-2 bg-yellow rounded-2xl px-3 py-2 text-xs font-bold text-dark">
            🏪 Mayoreo · Menudeo
          </div>
        </div>
      </div>

      {/* Barra de categorías */}
      <div className="mt-10 border-t border-dark/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex gap-2 overflow-x-auto">
          {[
            { label: '💄 Belleza', href: '/productos?cat=BELLEZA', bg: 'bg-dark text-white' },
            { label: '💍 Accesorios', href: '/productos?cat=ACCESORIOS', bg: 'bg-pink text-white' },
            { label: '🏠 Hogar', href: '/productos?cat=HOGAR', bg: 'bg-[#FF6BB3] text-white' },
            { label: '🍬 Dulcería', href: '/productos?cat=DULCERIA', bg: 'bg-yellow text-dark' },
            { label: '✨ Novedades', href: '/productos?cat=NOVEDADES', bg: 'bg-[#F06292] text-white' },
          ].map((cat) => (
            <a
              key={cat.href}
              href={cat.href}
              className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-opacity hover:opacity-80 ${cat.bg}`}
            >
              {cat.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
