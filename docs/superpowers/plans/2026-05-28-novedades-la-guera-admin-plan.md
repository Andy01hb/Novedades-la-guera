# Novedades La Güera — E-commerce PWA: Plan 2 (Admin Panel)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el panel de administración completo: autenticación con NextAuth, dashboard con métricas, gestión de pedidos con cambio de estado, y CRUD de catálogo de productos.

**Architecture:** Next.js 14 App Router con rutas protegidas bajo `/admin`. NextAuth para autenticación del admin. Dark mode palette (#0f172a). Server components para lectura de datos, client components para interacciones. Layout separado del cliente para mantener los temas visuales independientes.

**Tech Stack:** NextAuth v4 + bcryptjs, Prisma (ya configurado), Next.js App Router nested layouts, Tailwind (dark admin palette ya en tailwind.config.ts), Cloudinary (next-cloudinary para upload de imágenes)

---

## Mapa de archivos

```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx                    # Layout admin: dark bg, sidebar desktop, bottom nav mobile
│   │   ├── page.tsx                      # Redirect → /admin/dashboard
│   │   ├── login/
│   │   │   └── page.tsx                  # Página de login admin
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Stats del día + lista de pedidos recientes
│   │   ├── pedidos/
│   │   │   ├── page.tsx                  # Todos los pedidos con filtros de estado
│   │   │   └── [id]/
│   │   │       └── page.tsx              # Detalle del pedido + cambiar estado
│   │   ├── productos/
│   │   │   ├── page.tsx                  # Lista de productos del catálogo
│   │   │   └── nuevo/
│   │   │       └── page.tsx              # Formulario de nuevo producto
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts          # NextAuth handlers
│   │       ├── admin/
│   │       │   ├── orders/
│   │       │   │   └── [id]/
│   │       │   │       └── route.ts      # PATCH: cambiar estado del pedido
│   │       │   └── products/
│   │       │       ├── route.ts          # POST: crear producto
│   │       │       └── [id]/
│   │       │           └── route.ts      # PATCH/DELETE: editar/eliminar producto
├── components/
│   └── admin/
│       ├── AdminSidebar.tsx              # Sidebar desktop con nav links y badges
│       ├── AdminBottomNav.tsx            # Bottom nav mobile
│       ├── StatsCard.tsx                 # Tarjeta de métrica con delta
│       ├── OrdersTable.tsx               # Tabla de pedidos (desktop)
│       ├── OrdersList.tsx                # Lista de pedidos (mobile)
│       ├── OrderDetailPanel.tsx          # Panel lateral de detalle del pedido
│       └── ProductForm.tsx               # Formulario crear/editar producto
└── lib/
    └── auth.ts                           # NextAuth config (authOptions)
```

---

## Task 1: NextAuth — Configuración y Login

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/admin/login/page.tsx`

- [ ] **Step 1: Crear configuración de NextAuth**

Crear `src/lib/auth.ts`:

```typescript
import 'server-only'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.adminUser.findUnique({
          where: { email: credentials.email },
        })

        if (!user) return null

        const passwordMatch = await bcrypt.compare(credentials.password, user.password)
        if (!passwordMatch) return null

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
```

- [ ] **Step 2: Crear route handler de NextAuth**

Crear `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

- [ ] **Step 3: Crear página de login**

Crear `src/app/admin/login/page.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/admin/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink to-[#FF6BB3] flex items-center justify-center text-white font-black text-xl mx-auto mb-3">
            LG
          </div>
          <h1 className="text-white font-black text-2xl">Panel Admin</h1>
          <p className="text-admin-muted text-sm mt-1">Novedades La Güera</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-admin-card rounded-3xl p-6 border border-admin-border">
          <div className="space-y-4">
            <div>
              <label className="text-admin-muted text-sm font-medium block mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-2xl text-white text-sm focus:border-pink outline-none transition-colors"
                placeholder="admin@novedadeslagueraa.com"
                required
              />
            </div>

            <div>
              <label className="text-admin-muted text-sm font-medium block mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-border rounded-2xl text-white text-sm focus:border-pink outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink text-white font-bold py-3 rounded-2xl hover:bg-pink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar al panel'}
            </button>
          </div>
        </form>

        <p className="text-center text-admin-muted text-xs mt-4">
          <a href="/" className="hover:text-white transition-colors">← Volver a la tienda</a>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Instalar next-auth**

`next-auth` ya está instalado. Verificar:
```bash
npm list next-auth
```

Si no está instalado: `npm install next-auth`

- [ ] **Step 5: Verificar build**

```bash
npm run build
```

Expected: passes. The NextAuth provider and route handler compile correctly.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: nextauth credentials provider + admin login page"
```

---

## Task 2: Admin Layout + Protección de rutas

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/components/admin/AdminSidebar.tsx`
- Create: `src/components/admin/AdminBottomNav.tsx`

- [ ] **Step 1: Crear AdminSidebar**

Crear `src/components/admin/AdminSidebar.tsx`:

```typescript
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, ShoppingBag, Package, LogOut, ExternalLink } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/productos', label: 'Productos', icon: Package },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-52 bg-admin-card border-r border-admin-border min-h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-admin-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink to-[#FF6BB3] flex items-center justify-center text-white font-black text-xs">
            LG
          </div>
          <div>
            <p className="text-white font-bold text-xs leading-none">La Güera</p>
            <p className="text-admin-muted text-xs">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-pink/10 text-pink'
                  : 'text-admin-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-admin-border space-y-1">
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-admin-muted hover:text-white hover:bg-white/5 transition-colors"
        >
          <ExternalLink size={18} />
          Ver tienda
        </a>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-admin-muted hover:text-red-400 hover:bg-red-400/5 transition-colors"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Crear AdminBottomNav (mobile)**

Crear `src/components/admin/AdminBottomNav.tsx`:

```typescript
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Package } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/productos', label: 'Productos', icon: Package },
]

export default function AdminBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-admin-card border-t border-admin-border px-4 py-2 flex justify-around z-50">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${
              active ? 'text-pink' : 'text-admin-muted'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 3: Crear Admin Layout con protección de sesión**

Crear `src/app/admin/layout.tsx`:

```typescript
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminBottomNav from '@/components/admin/AdminBottomNav'
import SessionProvider from './SessionProvider'

interface Props {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: Props) {
  const session = await getServerSession(authOptions)

  // Allow login page without session
  // (this layout wraps all /admin/* routes including /admin/login)
  // We can't conditionally skip this check per sub-route in a layout,
  // so we check the URL in the request — but layouts don't have request access.
  // Instead, redirect to login and let the login page handle the rest.
  // The login page itself will redirect to dashboard if already logged in.

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
```

- [ ] **Step 4: Crear SessionProvider client wrapper**

Next.js App Router requires a client component to wrap `SessionProvider` from next-auth/react.

Crear `src/app/admin/SessionProvider.tsx`:

```typescript
'use client'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { Session } from 'next-auth'

export default function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  )
}
```

- [ ] **Step 5: Crear middleware para proteger rutas /admin**

Crear `src/middleware.ts`:

```typescript
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: '/admin/login',
  },
})

export const config = {
  matcher: ['/admin/dashboard/:path*', '/admin/pedidos/:path*', '/admin/productos/:path*'],
}
```

- [ ] **Step 6: Crear redirect page en /admin**

Crear `src/app/admin/page.tsx`:

```typescript
import { redirect } from 'next/navigation'

export default function AdminPage() {
  redirect('/admin/dashboard')
}
```

- [ ] **Step 7: Verificar build**

```bash
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: admin layout with nextauth protection, sidebar, bottom nav"
```

---

## Task 3: Admin Dashboard

**Files:**
- Create: `src/app/admin/dashboard/page.tsx`
- Create: `src/components/admin/StatsCard.tsx`

- [ ] **Step 1: Crear StatsCard**

Crear `src/components/admin/StatsCard.tsx`:

```typescript
interface StatsCardProps {
  title: string
  value: string | number
  delta?: string
  deltaPositive?: boolean
  icon: string
  color?: string
}

export default function StatsCard({ title, value, delta, deltaPositive, icon, color = 'text-pink' }: StatsCardProps) {
  return (
    <div className="bg-admin-card border border-admin-border rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-admin-muted text-sm font-medium">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      {delta && (
        <p className={`text-xs mt-1 font-medium ${deltaPositive ? 'text-green-400' : 'text-red-400'}`}>
          {deltaPositive ? '↑' : '↓'} {delta}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Crear Dashboard page**

Crear `src/app/admin/dashboard/page.tsx`:

```typescript
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import StatsCard from '@/components/admin/StatsCard'
import OrderStatusBadge from '@/components/ui/OrderStatusBadge'
import Link from 'next/link'
import { OrderStatus } from '@prisma/client'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let stats = { ordersToday: 0, salesToday: 0, pending: 0, shipped: 0 }
  let recentOrders: Awaited<ReturnType<typeof prisma.order.findMany>> = []

  try {
    const [ordersToday, pending, shipped, recent] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: today }, status: { not: 'CANCELLED' } },
        select: { total: true },
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { product: { select: { name: true } } }, take: 2 },
        },
      }),
    ])

    stats = {
      ordersToday: ordersToday.length,
      salesToday: ordersToday.reduce((sum, o) => sum + o.total, 0),
      pending,
      shipped,
    }
    recentOrders = recent
  } catch {
    // DB not connected — show empty state
  }

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Buenos días' : now.getHours() < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white font-black text-2xl">
          {greeting}, {session.user?.name?.split(' ')[0] ?? 'Admin'} 👋
        </h1>
        <p className="text-admin-muted text-sm mt-1">
          {new Intl.DateTimeFormat('es-MX', { dateStyle: 'full' }).format(new Date())}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Pedidos hoy" value={stats.ordersToday} icon="📦" />
        <StatsCard
          title="Ventas hoy"
          value={formatPrice(stats.salesToday)}
          icon="💰"
          color="text-green-400"
        />
        <StatsCard title="Pendientes" value={stats.pending} icon="🔵" color="text-blue-400" />
        <StatsCard title="En camino" value={stats.shipped} icon="🚀" color="text-purple-400" />
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">Pedidos recientes</h2>
          <Link href="/admin/pedidos" className="text-pink text-sm hover:underline">
            Ver todos →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-admin-card border border-admin-border rounded-2xl p-8 text-center">
            <p className="text-admin-muted">No hay pedidos aún</p>
          </div>
        ) : (
          <div className="bg-admin-card border border-admin-border rounded-2xl overflow-hidden">
            {/* Desktop table */}
            <table className="hidden lg:table w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border">
                  <th className="text-left text-admin-muted font-medium px-5 py-3">Pedido</th>
                  <th className="text-left text-admin-muted font-medium px-5 py-3">Cliente</th>
                  <th className="text-left text-admin-muted font-medium px-5 py-3">Productos</th>
                  <th className="text-left text-admin-muted font-medium px-5 py-3">Total</th>
                  <th className="text-left text-admin-muted font-medium px-5 py-3">Estado</th>
                  <th className="text-left text-admin-muted font-medium px-5 py-3">Fecha</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-admin-border last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3 font-mono text-admin-muted text-xs">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 text-white font-medium">{order.customerName}</td>
                    <td className="px-5 py-3 text-admin-muted">
                      {order.items[0]?.product.name}
                      {order.items.length > 1 && ` +${order.items.length - 1}`}
                    </td>
                    <td className="px-5 py-3 text-white font-bold">{formatPrice(order.total)}</td>
                    <td className="px-5 py-3">
                      <OrderStatusBadge status={order.status as OrderStatus} />
                    </td>
                    <td className="px-5 py-3 text-admin-muted text-xs">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="text-pink text-xs hover:underline"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile list */}
            <div className="lg:hidden divide-y divide-admin-border">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/admin/pedidos/${order.id}`} className="flex items-center justify-between p-4 hover:bg-white/2">
                  <div>
                    <p className="text-white font-medium text-sm">{order.customerName}</p>
                    <p className="text-admin-muted text-xs mt-0.5 font-mono">
                      #{order.id.slice(-6).toUpperCase()} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-sm">{formatPrice(order.total)}</p>
                    <div className="mt-1">
                      <OrderStatusBadge status={order.status as OrderStatus} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: admin dashboard with stats and recent orders"
```

---

## Task 4: Admin Pedidos — Lista y Detalle

**Files:**
- Create: `src/app/admin/pedidos/page.tsx`
- Create: `src/app/admin/pedidos/[id]/page.tsx`
- Create: `src/app/api/admin/orders/[id]/route.ts`

- [ ] **Step 1: Crear PATCH /api/admin/orders/[id]**

Crear `src/app/api/admin/orders/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'
import { z } from 'zod'

const UpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  try {
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
    })
    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }
}
```

- [ ] **Step 2: Crear página de lista de pedidos**

Crear `src/app/admin/pedidos/page.tsx`:

```typescript
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OrderStatusBadge from '@/components/ui/OrderStatusBadge'
import Link from 'next/link'
import { OrderStatus } from '@prisma/client'

const ALL_STATUSES: { value: string; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Nuevos' },
  { value: 'PREPARING', label: 'Preparando' },
  { value: 'SHIPPED', label: 'Enviados' },
  { value: 'DELIVERED', label: 'Entregados' },
  { value: 'CANCELLED', label: 'Cancelados' },
]

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

interface Props {
  searchParams: { status?: string }
}

export default async function PedidosPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const statusFilter = searchParams.status as OrderStatus | undefined

  let orders: Awaited<ReturnType<typeof prisma.order.findMany>> = []

  try {
    orders = await prisma.order.findMany({
      where: statusFilter && statusFilter !== 'ALL' ? { status: statusFilter } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: { select: { name: true } } },
          take: 2,
        },
      },
    })
  } catch {
    // DB not connected
  }

  const activeStatus = searchParams.status ?? 'ALL'

  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-white font-black text-2xl mb-6">Pedidos</h1>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {ALL_STATUSES.map(({ value, label }) => (
          <Link
            key={value}
            href={value === 'ALL' ? '/admin/pedidos' : `/admin/pedidos?status=${value}`}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeStatus === value
                ? 'bg-pink text-white'
                : 'bg-admin-card text-admin-muted hover:text-white border border-admin-border'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="bg-admin-card border border-admin-border rounded-2xl p-8 text-center">
          <p className="text-admin-muted">No hay pedidos con este filtro</p>
        </div>
      ) : (
        <div className="bg-admin-card border border-admin-border rounded-2xl overflow-hidden">
          {/* Desktop */}
          <table className="hidden lg:table w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border">
                {['Pedido', 'Cliente', 'Teléfono', 'Productos', 'Envío', 'Total', 'Estado', 'Fecha', ''].map((h) => (
                  <th key={h} className="text-left text-admin-muted font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-admin-border last:border-0 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 font-mono text-admin-muted text-xs">
                    #{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{order.customerName}</td>
                  <td className="px-4 py-3 text-admin-muted text-xs">{order.customerPhone}</td>
                  <td className="px-4 py-3 text-admin-muted text-xs">
                    {order.items[0]?.product.name}
                    {order.items.length > 1 && ` +${order.items.length - 1}`}
                  </td>
                  <td className="px-4 py-3 text-admin-muted text-xs">{order.deliveryType}</td>
                  <td className="px-4 py-3 text-white font-bold">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status as OrderStatus} />
                  </td>
                  <td className="px-4 py-3 text-admin-muted text-xs">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/pedidos/${order.id}`} className="text-pink text-xs hover:underline">
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile */}
          <div className="lg:hidden divide-y divide-admin-border">
            {orders.map((order) => (
              <Link key={order.id} href={`/admin/pedidos/${order.id}`} className="flex items-center justify-between p-4 hover:bg-white/2">
                <div>
                  <p className="text-white font-medium text-sm">{order.customerName}</p>
                  <p className="text-admin-muted text-xs mt-0.5">{order.customerPhone}</p>
                  <p className="text-admin-muted text-xs font-mono mt-0.5">
                    #{order.id.slice(-6).toUpperCase()} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-white font-bold text-sm">{formatPrice(order.total)}</p>
                  <div className="mt-1">
                    <OrderStatusBadge status={order.status as OrderStatus} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Crear página de detalle del pedido**

Crear `src/app/admin/pedidos/[id]/page.tsx`:

```typescript
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OrderStatusBadge from '@/components/ui/OrderStatusBadge'
import OrderStatusUpdater from './OrderStatusUpdater'
import { OrderStatus } from '@prisma/client'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(date)
}

const DELIVERY_LABELS: Record<string, string> = {
  LOCAL: '🏍️ Entrega local Juárez',
  PAQUETERIA: '📦 Paquetería nacional',
  RECOGER: '🏪 Recoger en tienda',
}

export default async function PedidoDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  let order = null
  try {
    order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: { select: { name: true, imageUrl: true, slug: true } },
          },
        },
      },
    })
  } catch {
    notFound()
  }

  if (!order) notFound()

  return (
    <div className="p-4 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/pedidos" className="text-admin-muted hover:text-white text-sm transition-colors">
          ← Pedidos
        </a>
        <span className="text-admin-border">/</span>
        <span className="text-white font-mono text-sm">#{order.id.slice(-6).toUpperCase()}</span>
        <OrderStatusBadge status={order.status as OrderStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-5">
          {/* Productos */}
          <div className="bg-admin-card border border-admin-border rounded-2xl p-5">
            <h2 className="text-white font-bold mb-4">Productos ({order.items.length})</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{item.product.name}</p>
                    <p className="text-admin-muted text-xs">
                      {formatPrice(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-white font-bold text-sm">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-admin-border mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-admin-muted">Subtotal</span>
                <span className="text-white">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-admin-muted">Envío ({DELIVERY_LABELS[order.deliveryType] ?? order.deliveryType})</span>
                <span className="text-white">{order.deliveryCost === 0 ? 'Gratis' : formatPrice(order.deliveryCost)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-pink text-lg">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className="bg-admin-card border border-admin-border rounded-2xl p-5">
            <h2 className="text-white font-bold mb-3">Dirección de entrega</h2>
            <div className="text-admin-muted text-sm space-y-1">
              <p className="text-white">{order.street}</p>
              <p>Col. {order.colonia}</p>
              <p>{order.city}, {order.state} C.P. {order.postalCode}</p>
              {order.references && (
                <p className="text-admin-muted italic">Ref: {order.references}</p>
              )}
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-5">
          {/* Datos del cliente */}
          <div className="bg-admin-card border border-admin-border rounded-2xl p-5">
            <h2 className="text-white font-bold mb-3">Cliente</h2>
            <div className="space-y-2 text-sm">
              <p className="text-white font-medium">{order.customerName}</p>
              <p className="text-admin-muted">{order.customerPhone}</p>
              <p className="text-admin-muted">{order.customerEmail}</p>
            </div>
            <a
              href={`https://wa.me/52${order.customerPhone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block text-center bg-green-600/20 text-green-400 border border-green-600/30 py-2 px-4 rounded-xl text-sm font-medium hover:bg-green-600/30 transition-colors"
            >
              💬 Notificar por WhatsApp
            </a>
          </div>

          {/* Info del pedido */}
          <div className="bg-admin-card border border-admin-border rounded-2xl p-5">
            <h2 className="text-white font-bold mb-3">Detalles</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-admin-muted">Fecha</span>
                <span className="text-white text-xs">{formatDate(order.createdAt)}</span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-admin-muted">Pagado</span>
                  <span className="text-green-400 text-xs">{formatDate(order.paidAt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-admin-muted">Tipo envío</span>
                <span className="text-white text-xs">{DELIVERY_LABELS[order.deliveryType]}</span>
              </div>
            </div>
          </div>

          {/* Cambiar estado */}
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status as OrderStatus} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Crear OrderStatusUpdater (client component)**

Crear `src/app/admin/pedidos/[id]/OrderStatusUpdater.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OrderStatus } from '@prisma/client'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: '🔵 Nuevo' },
  { value: 'PREPARING', label: '🟡 Preparando' },
  { value: 'SHIPPED', label: '🚀 Enviado' },
  { value: 'DELIVERED', label: '✅ Entregado' },
  { value: 'CANCELLED', label: '❌ Cancelado' },
]

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: OrderStatus
}) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    setSaving(false)
    if (res.ok) {
      setSaved(true)
      router.refresh()
    }
  }

  return (
    <div className="bg-admin-card border border-admin-border rounded-2xl p-5">
      <h2 className="text-white font-bold mb-3">Cambiar estado</h2>
      <select
        value={status}
        onChange={(e) => { setStatus(e.target.value as OrderStatus); setSaved(false) }}
        className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-xl text-white text-sm focus:border-pink outline-none mb-3"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        onClick={handleSave}
        disabled={saving || status === currentStatus}
        className="w-full bg-pink text-white font-bold py-2.5 rounded-xl text-sm hover:bg-pink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar estado'}
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Verificar build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: admin orders list and order detail with status management"
```

---

## Task 5: Admin Productos — Lista y Formulario

**Files:**
- Create: `src/app/admin/productos/page.tsx`
- Create: `src/app/admin/productos/nuevo/page.tsx`
- Create: `src/components/admin/ProductForm.tsx`
- Create: `src/app/api/admin/products/route.ts`
- Create: `src/app/api/admin/products/[id]/route.ts`

- [ ] **Step 1: Crear API de productos para admin**

Crear `src/app/api/admin/products/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Category, ProductBadge } from '@prisma/client'

const ProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description: z.string().optional(),
  category: z.nativeEnum(Category),
  badge: z.nativeEnum(ProductBadge).optional().nullable(),
  imageUrl: z.string().url(),
  priceRetail: z.number().int().positive(),
  priceWholesale: z.number().int().positive().optional().nullable(),
  wholesaleMin: z.number().int().positive().optional().nullable(),
  stock: z.number().int().min(0),
  active: z.boolean().default(true),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = ProductSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const product = await prisma.product.create({ data: parsed.data })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    const message = error instanceof Error && error.message.includes('Unique')
      ? 'Ya existe un producto con ese slug'
      : 'Error al crear el producto'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

Crear `src/app/api/admin/products/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Category, ProductBadge } from '@prisma/client'

const UpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  category: z.nativeEnum(Category).optional(),
  badge: z.nativeEnum(ProductBadge).optional().nullable(),
  imageUrl: z.string().url().optional(),
  priceRetail: z.number().int().positive().optional(),
  priceWholesale: z.number().int().positive().optional().nullable(),
  wholesaleMin: z.number().int().positive().optional().nullable(),
  stock: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data: parsed.data,
    })
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    await prisma.product.update({
      where: { id: params.id },
      data: { active: false },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }
}
```

Note: DELETE does a soft-delete (sets `active: false`) instead of actually deleting from DB to preserve order history integrity.

- [ ] **Step 2: Crear ProductForm**

Crear `src/components/admin/ProductForm.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Category, ProductBadge } from '@prisma/client'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  description: z.string().optional(),
  category: z.nativeEnum(Category),
  badge: z.nativeEnum(ProductBadge).optional().nullable(),
  imageUrl: z.string().url('URL inválida'),
  priceRetail: z.number({ invalid_type_error: 'Precio requerido' }).int().positive(),
  priceWholesale: z.number().int().positive().optional().nullable(),
  wholesaleMin: z.number().int().positive().optional().nullable(),
  stock: z.number({ invalid_type_error: 'Stock requerido' }).int().min(0),
  active: z.boolean(),
})

type FormData = z.infer<typeof schema>

const CATEGORY_OPTIONS = [
  { value: 'BELLEZA', label: 'Belleza' },
  { value: 'ACCESORIOS', label: 'Accesorios' },
  { value: 'HOGAR', label: 'Hogar' },
  { value: 'DULCERIA', label: 'Dulcería' },
  { value: 'NOVEDADES', label: 'Novedades' },
]

const inputClass = 'w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-xl text-white text-sm focus:border-pink outline-none transition-colors'
const labelClass = 'text-admin-muted text-sm font-medium block mb-1.5'

interface Props {
  defaultValues?: Partial<FormData>
  productId?: string
}

export default function ProductForm({ defaultValues, productId }: Props) {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      active: true,
      stock: 0,
      ...defaultValues,
    },
  })

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)

    const url = productId
      ? `/api/admin/products/${productId}`
      : '/api/admin/products'
    const method = productId ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const json = await res.json()
    if (!res.ok) {
      setSubmitError(json.error ?? 'Error al guardar el producto')
      return
    }

    router.push('/admin/productos')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Nombre del producto</label>
          <input {...register('name')} className={inputClass} placeholder="Set de Sombras Glam" />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Slug (URL)</label>
          <input {...register('slug')} className={inputClass} placeholder="set-sombras-glam" />
          {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug.message}</p>}
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Descripción</label>
          <textarea
            {...register('description')}
            className={`${inputClass} resize-none h-20`}
            placeholder="Descripción del producto..."
          />
        </div>

        <div>
          <label className={labelClass}>Categoría</label>
          <select {...register('category')} className={inputClass}>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Badge</label>
          <select {...register('badge')} className={inputClass}>
            <option value="">Sin badge</option>
            <option value="NUEVO">NUEVO</option>
            <option value="OFERTA">OFERTA</option>
            <option value="MAYOREO">MAYOREO</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className={labelClass}>URL de imagen (Cloudinary)</label>
          <input {...register('imageUrl')} className={inputClass} placeholder="https://res.cloudinary.com/..." />
          {errors.imageUrl && <p className="text-red-400 text-xs mt-1">{errors.imageUrl.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Precio menudeo (centavos)</label>
          <input
            {...register('priceRetail', { valueAsNumber: true })}
            type="number"
            className={inputClass}
            placeholder="18000 = $180 MXN"
          />
          {errors.priceRetail && <p className="text-red-400 text-xs mt-1">{errors.priceRetail.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Stock</label>
          <input
            {...register('stock', { valueAsNumber: true })}
            type="number"
            className={inputClass}
            min={0}
          />
          {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Precio mayoreo (centavos, opcional)</label>
          <input
            {...register('priceWholesale', { valueAsNumber: true, setValueAs: v => v === '' || isNaN(v) ? null : v })}
            type="number"
            className={inputClass}
            placeholder="14000 = $140 MXN"
          />
        </div>

        <div>
          <label className={labelClass}>Mínimo mayoreo (piezas)</label>
          <input
            {...register('wholesaleMin', { valueAsNumber: true, setValueAs: v => v === '' || isNaN(v) ? null : v })}
            type="number"
            className={inputClass}
            placeholder="6"
          />
        </div>

        <div className="col-span-2 flex items-center gap-3">
          <input
            {...register('active')}
            type="checkbox"
            id="active"
            className="w-4 h-4 accent-pink"
          />
          <label htmlFor="active" className="text-white text-sm font-medium">
            Producto activo (visible en la tienda)
          </label>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
          {submitError}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-pink text-white font-bold px-6 py-2.5 rounded-xl hover:bg-pink/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : productId ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <a
          href="/admin/productos"
          className="px-6 py-2.5 rounded-xl text-admin-muted hover:text-white border border-admin-border hover:border-white/20 transition-colors text-sm font-medium"
        >
          Cancelar
        </a>
      </div>
    </form>
  )
}
```

- [ ] **Step 3: Crear lista de productos del admin**

Crear `src/app/admin/productos/page.tsx`:

```typescript
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { CATEGORY_LABELS } from '@/types'
import { Category } from '@prisma/client'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)
}

export default async function ProductosAdminPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = []

  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    // DB not connected
  }

  const activeCount = products.filter((p) => p.active).length

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-black text-2xl">Productos</h1>
          <p className="text-admin-muted text-sm mt-1">
            {activeCount} activos · {products.length} total
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="bg-pink text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-pink/90 transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-admin-card border border-admin-border rounded-2xl p-8 text-center">
          <p className="text-admin-muted mb-4">No hay productos aún</p>
          <Link href="/admin/productos/nuevo" className="text-pink hover:underline text-sm">
            Crear el primer producto →
          </Link>
        </div>
      ) : (
        <div className="bg-admin-card border border-admin-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border">
                <th className="text-left text-admin-muted font-medium px-4 py-3">Producto</th>
                <th className="text-left text-admin-muted font-medium px-4 py-3 hidden md:table-cell">Categoría</th>
                <th className="text-left text-admin-muted font-medium px-4 py-3">Precio</th>
                <th className="text-left text-admin-muted font-medium px-4 py-3 hidden md:table-cell">Stock</th>
                <th className="text-left text-admin-muted font-medium px-4 py-3 hidden md:table-cell">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-admin-border last:border-0 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white/5 shrink-0">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-admin-muted text-xs font-mono">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-admin-muted hidden md:table-cell">
                    {CATEGORY_LABELS[product.category as string] ?? product.category}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    {formatPrice(product.priceRetail)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-400' : 'text-white'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      product.active ? 'bg-green-900/30 text-green-400' : 'bg-admin-bg text-admin-muted'
                    }`}>
                      {product.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      className="text-pink text-xs hover:underline"
                    >
                      Editar →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Crear página de nuevo producto**

Crear `src/app/admin/productos/nuevo/page.tsx`:

```typescript
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import ProductForm from '@/components/admin/ProductForm'

export default async function NuevoProductoPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <a href="/admin/productos" className="text-admin-muted hover:text-white text-sm transition-colors">
          ← Productos
        </a>
        <h1 className="text-white font-black text-2xl mt-2">Nuevo producto</h1>
      </div>

      <div className="bg-admin-card border border-admin-border rounded-2xl p-6">
        <ProductForm />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verificar build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: admin products list, product form, and product CRUD api"
```

---

## Checklist de verificación final (Plan 2)

Antes de considerar el Plan 2 completo, verificar:

- [ ] `npm run build` pasa sin errores
- [ ] `/admin/login` muestra el formulario de login en dark mode
- [ ] Al autenticarse con las credenciales del seed, redirige a `/admin/dashboard`
- [ ] Dashboard muestra stats del día y lista de pedidos
- [ ] `/admin/pedidos` muestra tabla con filtros por estado
- [ ] `/admin/pedidos/[id]` muestra detalle + selector de estado
- [ ] Cambiar estado desde el detalle actualiza el badge correctamente
- [ ] `/admin/productos` muestra la tabla de productos
- [ ] `/admin/productos/nuevo` muestra el formulario y crea productos
- [ ] Rutas protegidas redirigen a `/admin/login` sin sesión
- [ ] Sidebar visible en desktop, bottom nav en mobile
- [ ] Todo el admin está en dark mode (#0f172a)

```bash
git tag v0.2.0-admin
```
