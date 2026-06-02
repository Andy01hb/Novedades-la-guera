'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, AlertCircle, Loader2, Save, CheckCircle2 } from 'lucide-react'
import AddressPicker from '@/components/ui/AddressPicker'

interface Tier {
  id?: string
  label: string
  minKm: number
  maxKm: number | null
  fixedPrice: number | null
  basePrice: number | null
  pricePerKm: number | null
  order: number
  pricingMode: 'fixed' | 'perKm'
}

const inputClass = 'w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-xl text-white text-sm focus:border-pink outline-none transition-colors'
const labelClass = 'text-admin-muted text-xs font-medium block mb-1'

function formatMXN(cents: number | null) {
  if (cents === null) return ''
  return (cents / 100).toFixed(0)
}

function parseMXN(val: string): number | null {
  const n = parseFloat(val)
  return isNaN(n) ? null : Math.round(n * 100)
}

function tierKey(t: Tier) {
  const { id: _id, ...rest } = t
  return JSON.stringify(rest)
}

function StatusBadge({ dirty, isNew }: { dirty: boolean; isNew?: boolean }) {
  if (isNew) return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-medium">
      ● nuevo
    </span>
  )
  if (dirty) return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-medium">
      ● editando
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-medium">
      <CheckCircle2 size={10} /> guardado
    </span>
  )
}

export default function ShippingConfig() {
  const [storeAddress, setStoreAddress] = useState('')
  const [tiers, setTiers] = useState<Tier[]>([])
  const [savedAddress, setSavedAddress] = useState('')
  const [savedTiers, setSavedTiers] = useState<Tier[]>([])
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testAddress, setTestAddress] = useState('')
  const [testResult, setTestResult] = useState<{ cost: number; label: string; km: number } | null>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    fetch('/api/admin/shipping').then(r => r.json()).then(data => {
      const addr = data.storeAddress ?? ''
      const loaded: Tier[] = (data.tiers ?? []).map((t: Tier) => ({
        ...t,
        pricingMode: t.fixedPrice !== null ? 'fixed' : 'perKm',
      }))
      setStoreAddress(addr)
      setTiers(loaded)
      setSavedAddress(addr)
      setSavedTiers(loaded)
    })
  }, [])

  const isAddressDirty = storeAddress !== savedAddress
  const isTierDirty = (i: number) => i < savedTiers.length && tierKey(tiers[i]) !== tierKey(savedTiers[i])
  const isTierNew = (i: number) => i >= savedTiers.length
  const isDirty = isAddressDirty || tiers.length !== savedTiers.length || tiers.some((_, i) => isTierDirty(i))

  const addTier = () => {
    setTiers([...tiers, {
      label: 'Nuevo rango', minKm: 0, maxKm: null,
      fixedPrice: 0, basePrice: null, pricePerKm: null,
      order: tiers.length, pricingMode: 'fixed',
    }])
  }

  const updateTier = (i: number, changes: Partial<Tier>) => {
    setTiers(tiers.map((t, idx) => idx === i ? { ...t, ...changes } : t))
  }

  const removeTier = (i: number) => setTiers(tiers.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    setSaving(true); setError(null); setSaveSuccess(false)
    const payload = {
      storeAddress,
      tiers: tiers.map((t, i) => ({
        label: t.label, minKm: t.minKm, maxKm: t.maxKm, order: i,
        fixedPrice: t.pricingMode === 'fixed' ? t.fixedPrice : null,
        basePrice: t.pricingMode === 'perKm' ? t.basePrice : null,
        pricePerKm: t.pricingMode === 'perKm' ? t.pricePerKm : null,
      })),
    }
    const res = await fetch('/api/admin/shipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (res.ok) {
      setSavedAddress(storeAddress)
      setSavedTiers(tiers.map(t => ({ ...t })))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } else {
      setError('Error al guardar')
    }
  }

  const handleTest = async () => {
    if (!testAddress) return
    setTesting(true); setTestResult(null)
    const res = await fetch(`/api/shipping/estimate?address=${encodeURIComponent(testAddress)}`)
    const data = await res.json()
    setTesting(false)
    if (res.ok) setTestResult(data)
    else setError(data.error)
  }

  return (
    <div className="space-y-6">
      {/* Dirección de la tienda */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelClass} style={{ marginBottom: 0 }}>Dirección de la tienda (punto de origen)</label>
          <StatusBadge dirty={isAddressDirty} />
        </div>
        <AddressPicker
          value={storeAddress}
          onChange={setStoreAddress}
          placeholder="Av. Juárez 123, Centro, Ciudad Juárez, Chihuahua"
          theme="dark"
        />
      </div>

      {/* Rangos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-white text-sm font-semibold">Rangos de envío</p>
          <button onClick={addTier} className="flex items-center gap-1.5 text-pink text-xs hover:underline">
            <Plus size={13} /> Agregar rango
          </button>
        </div>

        {tiers.length === 0 && (
          <p className="text-admin-muted text-xs py-4 text-center border border-dashed border-admin-border rounded-2xl">
            No hay rangos configurados. Agrega uno para comenzar.
          </p>
        )}

        {tiers.map((tier, i) => (
          <div key={i} className={`bg-admin-bg border rounded-2xl p-4 space-y-3 transition-colors ${
            isTierNew(i)
              ? 'border-blue-500/40 border-l-2 border-l-blue-500'
              : isTierDirty(i)
              ? 'border-yellow-500/40 border-l-2 border-l-yellow-500'
              : 'border-admin-border'
          }`}>
            <div className="flex items-center justify-between">
              <input
                value={tier.label}
                onChange={e => updateTier(i, { label: e.target.value })}
                className="bg-transparent text-white font-semibold text-sm outline-none border-b border-transparent focus:border-pink pb-0.5 w-40"
                placeholder="Nombre del rango"
              />
              <div className="flex items-center gap-2">
                <StatusBadge dirty={isTierDirty(i)} isNew={isTierNew(i)} />
                <button onClick={() => removeTier(i)} className="text-admin-muted hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Desde (km)</label>
                <input type="number" value={tier.minKm}
                  onChange={e => updateTier(i, { minKm: parseFloat(e.target.value) || 0 })}
                  className={inputClass} min={0} />
              </div>
              <div>
                <label className={labelClass}>Hasta (km, vacío = sin límite)</label>
                <input type="number" value={tier.maxKm ?? ''}
                  onChange={e => updateTier(i, { maxKm: e.target.value ? parseFloat(e.target.value) : null })}
                  className={inputClass} min={0} placeholder="∞" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Tipo de precio</label>
              <div className="flex gap-2">
                {(['fixed', 'perKm'] as const).map(mode => (
                  <button key={mode} onClick={() => updateTier(i, { pricingMode: mode })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${tier.pricingMode === mode ? 'bg-pink text-white' : 'bg-admin-card text-admin-muted hover:text-white'}`}>
                    {mode === 'fixed' ? 'Precio fijo' : 'Precio por km'}
                  </button>
                ))}
              </div>
            </div>

            {tier.pricingMode === 'fixed' ? (
              <div>
                <label className={labelClass}>Costo fijo (pesos MXN, 0 = gratis)</label>
                <input type="number" value={formatMXN(tier.fixedPrice)}
                  onChange={e => updateTier(i, { fixedPrice: parseMXN(e.target.value) })}
                  className={inputClass} min={0} placeholder="80" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Costo base (pesos MXN)</label>
                  <input type="number" value={formatMXN(tier.basePrice)}
                    onChange={e => updateTier(i, { basePrice: parseMXN(e.target.value) })}
                    className={inputClass} min={0} placeholder="50" />
                </div>
                <div>
                  <label className={labelClass}>+ por km (pesos MXN)</label>
                  <input type="number" value={formatMXN(tier.pricePerKm)}
                    onChange={e => updateTier(i, { pricePerKm: parseMXN(e.target.value) })}
                    className={inputClass} min={0} placeholder="2" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Calculadora de prueba */}
      <div className="bg-admin-bg border border-admin-border rounded-2xl p-4 space-y-3">
        <p className="text-white text-sm font-semibold">Probar calculadora</p>
        <div className="flex gap-2">
          <input value={testAddress} onChange={e => setTestAddress(e.target.value)}
            className={`${inputClass} flex-1`} placeholder="Dirección del cliente de prueba" />
          <button onClick={handleTest} disabled={testing || !testAddress}
            className="px-4 py-2 bg-pink/10 text-pink text-sm font-medium rounded-xl hover:bg-pink/20 transition-colors disabled:opacity-40">
            {testing ? <Loader2 size={14} className="animate-spin" /> : 'Calcular'}
          </button>
        </div>
        {testResult && (
          <p className="text-green-400 text-xs">
            {testResult.km} km → {testResult.label}: <strong>${(testResult.cost / 100).toFixed(0)} MXN</strong>
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-xl">
          <AlertCircle size={14} className="text-red-400" />
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || !isDirty}
        className={`w-full font-bold py-3 rounded-2xl transition-all text-sm flex items-center justify-center gap-2 ${
          saveSuccess
            ? 'bg-green-500 text-white'
            : isDirty
            ? 'bg-pink text-white hover:bg-pink/90'
            : 'bg-admin-card text-admin-muted cursor-not-allowed border border-admin-border'
        } disabled:opacity-70`}
      >
        {saving ? (
          <><Loader2 size={15} className="animate-spin" /> Guardando...</>
        ) : saveSuccess ? (
          <><CheckCircle2 size={15} /> Guardado</>
        ) : isDirty ? (
          <><Save size={15} /> Guardar configuración</>
        ) : (
          <><CheckCircle2 size={15} /> Sin cambios pendientes</>
        )}
      </button>
    </div>
  )
}
