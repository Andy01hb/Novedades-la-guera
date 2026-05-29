'use client'
import Image from 'next/image'
import { useState } from 'react'

interface Props {
  size?: number
  src?: string | null
}

export default function StoreLogo({ size = 40, src }: Props) {
  const [error, setError] = useState(false)
  const imgSrc = src || '/logo.png'

  if (error) {
    return (
      <div
        className="rounded-full bg-gradient-to-br from-pink to-[#FF6BB3] flex items-center justify-center text-white font-black shrink-0"
        style={{ width: size, height: size, fontSize: Math.round(size * 0.3) }}
      >
        LG
      </div>
    )
  }

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Image
        src={imgSrc}
        alt="Novedades La Güera"
        fill
        className="object-contain"
        unoptimized={imgSrc.startsWith('https://')}
        onError={() => setError(true)}
      />
    </div>
  )
}
