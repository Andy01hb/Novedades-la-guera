'use client'
import { SessionProvider } from 'next-auth/react'

export default function CustomerSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/api/customer-auth">
      {children}
    </SessionProvider>
  )
}
