export default function StripeSeal() {
  return (
    <section className="py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-dark/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="font-bold text-dark text-sm">Compra 100% protegida</p>
            <p className="text-dark/50 text-xs">Tus datos están seguros con cifrado SSL</p>
          </div>
          <div className="sm:ml-auto flex items-center gap-3 text-dark/40 text-xs font-medium">
            <span className="font-bold text-[#635BFF]">Stripe</span>
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
            <span>🛡️ Compra protegida</span>
          </div>
        </div>
      </div>
    </section>
  )
}
