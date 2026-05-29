'use client'
import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { Upload, Download, CheckCircle2, AlertCircle, X } from 'lucide-react'

const CATEGORIES = ['BELLEZA', 'ACCESORIOS', 'HOGAR', 'DULCERIA', 'NOVEDADES']
const BADGES = ['NUEVO', 'OFERTA', 'MAYOREO']

interface ParsedRow {
  name: string
  slug: string
  description?: string | null
  category: string
  badge?: string | null
  imageUrl?: string | null
  priceRetail: number
  priceWholesale?: number | null
  wholesaleMin?: number | null
  stock: number
  active: boolean
}

interface ImportError {
  row: number
  reason: string
}

interface ImportResult {
  imported: number
  errors: ImportError[]
}

function normalizeRow(raw: Record<string, unknown>): ParsedRow {
  const str = (v: unknown) => (v != null ? String(v).trim() : '')
  const num = (v: unknown) => {
    const n = Number(v)
    return isNaN(n) ? null : Math.round(n * 100)
  }
  const numInt = (v: unknown) => {
    const n = Number(v)
    return isNaN(n) ? null : Math.round(n)
  }

  const category = str(raw['categoria'] ?? raw['category']).toUpperCase()
  const badge = str(raw['badge']).toUpperCase() || null

  return {
    name: str(raw['nombre'] ?? raw['name']),
    slug: str(raw['slug']).toLowerCase(),
    description: str(raw['descripcion'] ?? raw['description']) || null,
    category: CATEGORIES.includes(category) ? category : '',
    badge: badge && BADGES.includes(badge) ? badge : null,
    imageUrl: str(raw['imagen_url'] ?? raw['imageUrl'] ?? raw['imagen']) || null,
    priceRetail: num(raw['precio_menudeo'] ?? raw['priceRetail']) ?? 0,
    priceWholesale: num(raw['precio_mayoreo'] ?? raw['priceWholesale']),
    wholesaleMin: numInt(raw['minimo_mayoreo'] ?? raw['wholesaleMin']),
    stock: numInt(raw['stock']) ?? 0,
    active: str(raw['activo'] ?? raw['active']).toLowerCase() !== 'no',
  }
}

function downloadTemplate() {
  const headers = ['nombre', 'slug', 'descripcion', 'categoria', 'badge', 'imagen_url', 'precio_menudeo', 'precio_mayoreo', 'minimo_mayoreo', 'stock', 'activo']
  const example = ['Labial Rojo', 'labial-rojo', 'Labial de larga duración', 'BELLEZA', 'NUEVO', 'https://res.cloudinary.com/...', 180, 140, 6, 20, 'si']
  const ws = XLSX.utils.aoa_to_sheet([headers, example])
  ws['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 2, 14) }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Productos')
  XLSX.writeFile(wb, 'plantilla_productos.xlsx')
}

export default function ProductImporter() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleFile = (file: File) => {
    setResult(null)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)
      setRows(raw.map(normalizeRow))
    }
    reader.readAsArrayBuffer(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleImport = async () => {
    setImporting(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows),
      })
      const data = await res.json()
      setResult(data)
      if (data.imported > 0) {
        setRows([])
        setFileName(null)
      }
    } finally {
      setImporting(false)
    }
  }

  const clearFile = () => {
    setRows([])
    setFileName(null)
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 border border-admin-border text-admin-muted hover:text-white hover:border-white/20 rounded-xl text-sm transition-colors"
        >
          <Download size={15} />
          Descargar plantilla
        </button>
      </div>

      {!fileName ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-admin-border hover:border-pink/50 rounded-3xl p-12 flex flex-col items-center gap-3 cursor-pointer transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-pink/10 flex items-center justify-center">
            <Upload size={22} className="text-pink" />
          </div>
          <p className="text-white font-semibold text-sm">Arrastra tu archivo Excel aquí</p>
          <p className="text-admin-muted text-xs">o haz clic para seleccionarlo — .xlsx</p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
          />
        </div>
      ) : (
        <div className="bg-admin-card border border-admin-border rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">{fileName}</p>
              <p className="text-admin-muted text-xs mt-0.5">{rows.length} filas detectadas</p>
            </div>
            <button onClick={clearFile} className="text-admin-muted hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-admin-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-admin-border">
                  {['nombre', 'slug', 'categoría', 'precio', 'stock', 'activo'].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-admin-muted font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b border-admin-border/50 last:border-0">
                    <td className="px-3 py-2 text-white">{row.name || <span className="text-red-400">—</span>}</td>
                    <td className="px-3 py-2 text-admin-muted">{row.slug || <span className="text-red-400">—</span>}</td>
                    <td className="px-3 py-2 text-admin-muted">{row.category || <span className="text-red-400">inválida</span>}</td>
                    <td className="px-3 py-2 text-admin-muted">${(row.priceRetail / 100).toFixed(0)}</td>
                    <td className="px-3 py-2 text-admin-muted">{row.stock}</td>
                    <td className="px-3 py-2 text-admin-muted">{row.active ? 'sí' : 'no'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 10 && (
              <p className="text-admin-muted text-xs px-3 py-2">... y {rows.length - 10} filas más</p>
            )}
          </div>

          <button
            onClick={handleImport}
            disabled={importing || rows.length === 0}
            className="bg-pink text-white font-bold px-6 py-2.5 rounded-xl hover:bg-pink/90 transition-colors disabled:opacity-50 text-sm"
          >
            {importing ? 'Importando...' : `Importar ${rows.length} productos`}
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          {result.imported > 0 && (
            <div className="flex items-center gap-2 p-4 bg-green-900/20 border border-green-500/30 rounded-2xl">
              <CheckCircle2 size={16} className="text-green-400 shrink-0" />
              <p className="text-green-400 text-sm font-medium">{result.imported} producto{result.imported !== 1 ? 's' : ''} importado{result.imported !== 1 ? 's' : ''} correctamente</p>
            </div>
          )}
          {result.errors.length > 0 && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <p className="text-red-400 text-sm font-medium">{result.errors.length} fila{result.errors.length !== 1 ? 's' : ''} con error</p>
              </div>
              <ul className="space-y-1 pl-6">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-red-300/80 text-xs">Fila {e.row}: {e.reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
