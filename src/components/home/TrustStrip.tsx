const BENEFITS = [
  { icon: '🚀', title: 'Envío Rápido', desc: 'Juárez mismo día · República 3-5 días' },
  { icon: '⭐', title: 'Calidad Garantizada', desc: 'Productos seleccionados con amor' },
  { icon: '🔒', title: 'Pago Seguro', desc: 'Procesado por Stripe' },
  { icon: '💰', title: 'Precios Bajos', desc: 'Mayoreo y menudeo disponible' },
]

export default function TrustStrip() {
  return (
    <section className="bg-white py-10 border-y border-dark/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
              <span className="text-3xl">{b.icon}</span>
              <div>
                <p className="font-bold text-dark text-sm">{b.title}</p>
                <p className="text-dark/50 text-xs">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
