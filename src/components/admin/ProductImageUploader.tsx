'use client'
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary'
import Image from 'next/image'
import { Upload } from 'lucide-react'

interface Props {
  value: string | null
  onChange: (url: string) => void
}

const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? ''

export default function ProductImageUploader({ value, onChange }: Props) {
  const handleUpload = (result: CloudinaryUploadWidgetResults) => {
    const info = result?.info
    const url = typeof info === 'object' && info !== null ? (info as { secure_url?: string }).secure_url : undefined
    if (url) onChange(url)
  }

  return (
    <div className="flex items-start gap-4">
      <div className="w-24 h-24 rounded-2xl bg-admin-bg border border-admin-border flex items-center justify-center overflow-hidden shrink-0">
        {value ? (
          <Image
            src={value}
            alt="Imagen del producto"
            width={96}
            height={96}
            className="object-contain w-full h-full"
            unoptimized
          />
        ) : (
          <span className="text-admin-muted text-xs text-center px-2 leading-tight">Sin imagen</span>
        )}
      </div>

      <CldUploadWidget
        uploadPreset={UPLOAD_PRESET}
        onSuccess={handleUpload}
        options={{ maxFiles: 1, resourceType: 'image' }}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => open()}
            disabled={!UPLOAD_PRESET}
            className="flex items-center gap-2 px-4 py-2 bg-pink/10 text-pink text-sm font-medium rounded-xl hover:bg-pink/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Upload size={15} />
            {value ? 'Cambiar imagen' : 'Subir imagen'}
          </button>
        )}
      </CldUploadWidget>
    </div>
  )
}
