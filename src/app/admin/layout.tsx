import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminBottomNav from '@/components/admin/AdminBottomNav'
import SessionProvider from './SessionProvider'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-admin-bg">
        {session && (
          <>
            <AdminSidebar />
            <AdminBottomNav />
          </>
        )}
        <div className={session ? 'lg:ml-52 pb-16 lg:pb-0' : ''}>
          {children}
        </div>
      </div>
    </SessionProvider>
  )
}
