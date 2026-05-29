'use client'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import { useState } from 'react'
import { Upload, CheckCircle2 } from 'lucide-react'

interface Props {
  label: string
  description?: string
  settingKey: string
  currentUrl: string | null
  uploadPreset: string
}

export default function ImageUploader({ label, description, settingKey, currentUrl, uploadPreset }: Props) {
  const [savedUrl, setSavedUrl] = useState<string | null>(currentUrl)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpload = async (result: any) => {
    const url: string | undefined = result?.info?.secure_url
    if (!url) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: settingKey, value: url }),
      })
      if (!res.ok) throw new Error()
      setSavedUrl(url)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-white font-semibold text-sm">{label}</p>
        {description && <p className="text-admin-muted text-xs mt-0.5">{description}</p>}
      </div>

      <div className="w-24 h-24 rounded-2xl bg-admin-bg border border-admin-border flex items-center justify-center overflow-hidden">
        {savedUrl ? (
          <Image
            src={savedUrl}
            alt={label}
            width={96}
            height={96}
            className="object-contain w-full h-full"
            unoptimized
          />
        ) : (
          <span className="text-admin-muted text-xs text-center px-2 leading-tight">Sin imagen</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <CldUploadWidget
          uploadPreset={uploadPreset}
          onSuccess={handleUpload}
          options={{ maxFiles: 1, resourceType: 'image' }}
        >
          {({ open }) => (
            <button
              onClick={() => open()}
              disabled={saving || !uploadPreset}
              className="flex items-center gap-2 px-4 py-2 bg-pink/10 text-pink text-sm font-medium rounded-xl hover:bg-pink/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Upload size={15} />
              {saving ? 'Guardando...' : 'Subir imagen'}
            </button>
          )}
        </CldUploadWidget>

        {success && (
          <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
            <CheckCircle2 size={14} />
            Guardado
          </span>
        )}
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
