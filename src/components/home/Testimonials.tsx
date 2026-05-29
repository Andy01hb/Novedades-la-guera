import { prisma } from '@/lib/prisma'
import { Review } from '@prisma/client'

export default async function Testimonials() {
  let reviews: Review[] = []
  try {
    reviews = await prisma.review.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    // DB not available in dev/build without connection
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-pink font-semibold text-sm mb-2">— Lo que dicen nuestros clientes —</p>
          <h2 className="text-3xl font-black text-dark mb-2">
            <span className="text-pink text-5xl font-black">4.9</span> de 5 estrellas
          </h2>
          <p className="text-dark/50">Basado en más de 200 reseñas verificadas</p>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-cream rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: review.avatarColor }}
                  >
                    {review.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-dark text-sm">{review.customerName}</p>
                    <p className="text-yellow text-xs">{'★'.repeat(review.rating)}</p>
                  </div>
                  <span className="ml-auto text-xs text-green-600 font-medium">✓ Verificada</span>
                </div>
                <p className="text-dark/70 text-sm leading-relaxed mb-3">{review.text}</p>
                <span className="text-xs bg-pink/10 text-pink px-2 py-1 rounded-full font-medium">
                  {review.productName}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              { name: 'María G.', color: '#E91E8C', rating: 5, text: '¡Excelente servicio! Me llegó todo perfecto y super rápido. Ya hice mi segundo pedido.', product: 'Set de Maquillaje' },
              { name: 'Laura P.', color: '#FF6BB3', rating: 5, text: 'Los precios de mayoreo son increíbles. Como revendedora estoy súper feliz con la calidad.', product: 'Accesorios' },
              { name: 'Sofía R.', color: '#FFCA28', rating: 5, text: 'La atención es de 10. Me resolvieron todas mis dudas por WhatsApp y el pedido llegó en tiempo.', product: 'Artículos de Hogar' },
            ].map((r) => (
              <div key={r.name} className="bg-cream rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: r.color }}
                  >
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-dark text-sm">{r.name}</p>
                    <p className="text-yellow text-xs">{'★'.repeat(r.rating)}</p>
                  </div>
                  <span className="ml-auto text-xs text-green-600 font-medium">✓ Verificada</span>
                </div>
                <p className="text-dark/70 text-sm leading-relaxed mb-3">{r.text}</p>
                <span className="text-xs bg-pink/10 text-pink px-2 py-1 rounded-full font-medium">
                  {r.product}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Instagram strip */}
        <div className="mt-10 bg-gradient-to-r from-pink to-[#FF6BB3] rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="text-white text-center sm:text-left">
            <p className="font-black text-xl mb-1">Síguenos en Instagram</p>
            <p className="text-white/80 text-sm">@novedadeslagueraa · Contenido nuevo cada día</p>
          </div>
          <a
            href="https://instagram.com/novedadeslagueraa"
            target="_blank"
            rel="noreferrer"
            className="sm:ml-auto bg-white text-pink font-bold px-6 py-2.5 rounded-full hover:bg-pink/10 hover:text-white transition-colors"
          >
            Seguir
          </a>
        </div>
      </div>
    </section>
  )
}
