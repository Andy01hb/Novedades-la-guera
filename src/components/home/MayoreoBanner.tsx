import Link from 'next/link'

const CHECKS = [
  'Precios desde 6 piezas por artículo',
  'Surtido amplio en todas las categorías',
  'Envío especial para pedidos grandes',
  'Atención personalizada por WhatsApp',
]

const STATS = [
  { value: '1K+', label: 'Clientes mayoreo' },
  { value: '500+', label: 'Productos disponibles' },
  { value: '4.9★', label: 'Calificación' },
  { value: '3 años', label: 'En el mercado' },
]

export default function MayoreoBanner() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-dark to-[#2d1b4e] rounded-3xl overflow-hidden relative">
          {/* Blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow/10 rounded-full blur-2xl" />

          <div className="relative p-8 lg:p-12 flex flex-col lg:flex-row gap-10">
            {/* Texto */}
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-yellow text-dark text-xs font-bold rounded-full mb-4">
                ⭐ Programa Mayoreo
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-white mb-2">
                Precios especiales<br />
                para <span className="text-yellow">revendedores</span>
              </h2>
              <p className="text-white/60 mb-6">Compra en cantidad y maximiza tus ganancias.</p>
              <ul className="space-y-3 mb-8">
                {CHECKS.map((check) => (
                  <li key={check} className="flex items-center gap-2 text-white/80 text-sm">
                    <span className="text-yellow">✦</span> {check}
                  </li>
                ))}
              </ul>
              <Link href="/productos?mayoreo=true" className="btn-primary inline-block">
                Ver precios mayoreo →
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-6 lg:w-64">
              <div className="grid grid-cols-2 gap-4">
                {STATS.map((s) => (
                  <div key={s.label} className="bg-white/5 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-black text-yellow">{s.value}</p>
                    <p className="text-white/50 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <p className="text-white font-bold text-sm mb-3">¿Cómo ordenar?</p>
                {['1. Elige tus productos', '2. Agrega al carrito', '3. Paga con Stripe'].map((step) => (
                  <p key={step} className="text-white/50 text-xs py-1 border-b border-white/5 last:border-0">
                    {step}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
