'use client'
import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, Loader2, X, CheckCircle2, ExternalLink } from 'lucide-react'

export interface AddressDetails {
  address: string
  street: string | null
  colonia: string | null
  postalCode: string | null
  city: string | null
  state: string | null
}

interface Suggestion {
  description: string
  placeId: string
}

interface Props {
  value: string
  onChange: (address: string) => void
  onAddressDetails?: (details: AddressDetails) => void
  placeholder?: string
  theme?: 'dark' | 'light'
}

export default function AddressPicker({ value, onChange, onAddressDetails, placeholder, theme = 'light' }: Props) {
  const dark = theme === 'dark'

  const [query, setQuery] = useState(value || '')
  const [confirmed, setConfirmed] = useState(value || '')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [mapError, setMapError] = useState(false)

  const skipRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Sync when external value changes (e.g. initial data load)
  useEffect(() => {
    if (value && value !== confirmed) {
      skipRef.current = true
      setQuery(value)
      setConfirmed(value)
      setMapError(false)
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced autocomplete
  useEffect(() => {
    if (skipRef.current) { skipRef.current = false; return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 3) { setSuggestions([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/maps/autocomplete?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        const preds: Suggestion[] = data.predictions ?? []
        setSuggestions(preds)
        setOpen(preds.length > 0)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 350)
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const confirm = (address: string, details?: AddressDetails) => {
    setQuery(address)
    setConfirmed(address)
    onChange(address)
    setSuggestions([])
    setOpen(false)
    setMapError(false)
    if (details && onAddressDetails) onAddressDetails(details)
  }

  const selectSuggestion = async (s: Suggestion) => {
    // Optimistically confirm with description, then fetch structured details
    confirm(s.description)
    if (onAddressDetails) {
      try {
        const res = await fetch(`/api/maps/place-details?placeId=${encodeURIComponent(s.placeId)}`)
        const data: AddressDetails = await res.json()
        if (data.address) onAddressDetails(data)
      } catch { /* no-op */ }
    }
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`/api/maps/reverse-geocode?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
          const data: AddressDetails = await res.json()
          if (data.address) confirm(data.address, data)
        } finally {
          setLocating(false)
        }
      },
      () => setLocating(false),
      { timeout: 8000 }
    )
  }

  const clear = () => {
    setQuery('')
    setConfirmed('')
    onChange('')
    setSuggestions([])
    setOpen(false)
  }

  // Styles
  const inputBase = dark
    ? 'w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-xl text-white text-sm focus:border-pink outline-none transition-colors pr-16'
    : 'w-full px-4 py-3 border border-gray-200 rounded-2xl text-dark text-sm focus:border-pink focus:outline-none transition-colors pr-16'
  const dropBg = dark ? 'bg-admin-card border-admin-border' : 'bg-white border-gray-100'
  const dropItem = dark ? 'text-white hover:bg-white/5' : 'text-dark hover:bg-pink/5'
  const mutedColor = dark ? 'text-admin-muted' : 'text-dark/40'
  const chipBg = dark ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200'
  const chipText = dark ? 'text-green-400' : 'text-green-700'

  return (
    <div className="space-y-2">
      {/* Input row */}
      <div ref={wrapperRef} className="relative">
        <div className="relative">
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); onChange(e.target.value) }}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            className={inputBase}
            placeholder={placeholder ?? 'Buscar dirección...'}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {loading && <Loader2 size={13} className="animate-spin text-pink" />}
            {query && !loading && (
              <button type="button" onClick={clear}
                className={`p-1 rounded-lg ${mutedColor} hover:text-pink transition-colors`}>
                <X size={13} />
              </button>
            )}
            <button type="button" onClick={useMyLocation} disabled={locating}
              title="Usar mi ubicación"
              className={`p-1 rounded-lg ${mutedColor} hover:text-pink transition-colors disabled:opacity-40`}>
              {locating ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
            </button>
          </div>
        </div>

        {/* Autocomplete dropdown */}
        {open && suggestions.length > 0 && (
          <div className={`absolute z-50 top-full left-0 right-0 mt-1 rounded-2xl border shadow-lg overflow-hidden ${dropBg}`}>
            {suggestions.map((s, i) => (
              <button key={i} type="button" onMouseDown={() => selectSuggestion(s)}
                className={`w-full flex items-start gap-2 px-4 py-2.5 text-left text-sm transition-colors ${dropItem}`}>
                <MapPin size={13} className="text-pink shrink-0 mt-0.5" />
                <span className="leading-snug text-xs">{s.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation chip */}
      {confirmed && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${chipBg} ${chipText}`}>
          <CheckCircle2 size={13} className="shrink-0" />
          <span className="flex-1 truncate">{confirmed}</span>
          <button type="button" onClick={clear}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Mini static map */}
      {confirmed && (
        <div className={`rounded-2xl overflow-hidden border ${dark ? 'border-admin-border' : 'border-gray-200'}`}>
          {!mapError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/maps/static-map?q=${encodeURIComponent(confirmed)}`}
              alt="Mapa"
              className="w-full object-cover"
              style={{ height: 160 }}
              onError={() => setMapError(true)}
            />
          ) : (
            <div className={`flex items-center justify-center h-24 text-xs ${mutedColor}`}>
              No se pudo cargar el mapa
            </div>
          )}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(confirmed)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-end gap-1 px-3 py-1.5 text-xs ${dark ? 'bg-admin-card text-admin-muted hover:text-white' : 'bg-gray-50 text-dark/40 hover:text-dark/70'} transition-colors`}
          >
            Ver en Google Maps <ExternalLink size={10} />
          </a>
        </div>
      )}
    </div>
  )
}
