# Novedades La Güera — E-commerce PWA: Plan 1 (Fundación + Tienda Cliente)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffoldear el proyecto Next.js completo con base de datos, sistema de diseño y todas las páginas de la tienda cliente (Home → Catálogo → Producto → Carrito → Checkout Stripe → Confirmación → Seguimiento).

**Architecture:** Next.js 14 App Router con TypeScript. Tailwind CSS con tokens de marca personalizados. Prisma + PostgreSQL para datos. Stripe Elements para pago en 3 pasos. Zustand para estado del carrito en cliente. Cloudinary para imágenes de productos.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Stripe (@stripe/stripe-js + @stripe/react-stripe-js + stripe), NextAuth, Cloudinary, Zustand, React Hook Form, Zod, next-pwa

---

## Mapa de archivos

```
/
├── prisma/
│   └── schema.prisma                    # Modelos: Product, Order, OrderItem, Review, AdminUser
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout: fuentes, providers, metadata PWA
│   │   ├── page.tsx                     # Home: Hero + Featured + Trust + Testimonios + Footer
│   │   ├── productos/
│   │   │   ├── page.tsx                 # Catálogo con filtros por categoría
│   │   │   └── [slug]/
│   │   │       └── page.tsx             # Detalle de producto
│   │   ├── carrito/
│   │   │   └── page.tsx                 # Carrito de compra
│   │   ├── checkout/
│   │   │   └── page.tsx                 # Formulario 3 pasos + Stripe Elements
│   │   ├── confirmacion/
│   │   │   └── [id]/
│   │   │       └── page.tsx             # Confirmación de pedido
│   │   ├── seguimiento/
│   │   │   └── [id]/
│   │   │       └── page.tsx             # Estado del pedido
│   │   └── api/
│   │       ├── products/
│   │       │   └── route.ts             # GET /api/products?category=&search=
│   │       ├── orders/
│   │       │   └── route.ts             # GET /api/orders/[id]
│   │       ├── checkout/
│   │       │   └── route.ts             # POST → crea PaymentIntent + pedido pending
│   │       └── webhooks/
│   │           └── stripe/
│   │               └── route.ts         # POST Stripe webhook → confirma pedido
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Navbar.tsx               # Topbar responsive con carrito y menú
│   │   │   ├── Footer.tsx               # Footer oscuro 4 columnas
│   │   │   ├── ProductCard.tsx          # Card de producto reutilizable
│   │   │   ├── CategoryChip.tsx         # Chip de filtro de categoría
│   │   │   ├── OrderStatusBadge.tsx     # Badge de estado de pedido
│   │   │   └── DeliveryOption.tsx       # Selector de tipo de envío en checkout
│   │   ├── home/
│   │   │   ├── Hero.tsx                 # Hero split: texto + mascota + blobs
│   │   │   ├── FeaturedProducts.tsx     # Grid de productos destacados
│   │   │   ├── TrustStrip.tsx           # Strip de 4 beneficios
│   │   │   ├── MayoreoBanner.tsx        # Banner oscuro programa mayoreo
│   │   │   ├── StripeSeal.tsx           # Badge de pago seguro con Stripe
│   │   │   └── Testimonials.tsx         # Reviews + rating bar + Instagram strip
│   │   ├── checkout/
│   │   │   ├── StepPersonal.tsx         # Paso 1: nombre, teléfono, correo
│   │   │   ├── StepAddress.tsx          # Paso 2: dirección + selector de envío
│   │   │   └── StepPayment.tsx          # Paso 3: Stripe Elements
│   │   └── cart/
│   │       └── CartItem.tsx             # Item individual en el carrito
│   ├── lib/
│   │   ├── prisma.ts                    # Singleton PrismaClient
│   │   ├── stripe.ts                    # Singleton Stripe server
│   │   └── cloudinary.ts               # Config Cloudinary upload
│   ├── store/
│   │   └── cart.ts                      # Zustand: items, add, remove, updateQty, clear
│   ├── types/
│   │   └── index.ts                     # Tipos compartidos: CartItem, CheckoutFormData, etc.
│   └── styles/
│       └── globals.css                  # CSS vars de marca + @tailwind directives
├── public/
│   ├── manifest.json                    # PWA manifest
│   └── icons/                           # Íconos PWA (192x192, 512x512)
├── tailwind.config.ts                   # Tokens: colores marca, fuentes, sombras
├── next.config.ts                       # next-pwa, imágenes Cloudinary
└── .env.local                           # Variables de entorno (template)
```

---

## Task 1: Bootstrap del proyecto Next.js

**Files:**
- Create: `tailwind.config.ts`
- Create: `next.config.ts`
- Create: `src/styles/globals.css`
- Create: `.env.local`
- Create: `src/lib/prisma.ts`
- Create: `src/lib/stripe.ts`

- [ ] **Step 1: Crear proyecto Next.js**

```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

Cuando pregunte si usar Turbopack: **No**.

- [ ] **Step 2: Instalar dependencias**

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
npm install @prisma/client prisma
npm install next-auth
npm install zustand
npm install react-hook-form zod @hookform/resolvers
npm install next-cloudinary
npm install next-pwa
npm install @types/node --save-dev
```

- [ ] **Step 3: Configurar Tailwind con tokens de marca**

Reemplazar `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        pink: {
          DEFAULT: '#E91E8C',
          light: '#FF6BB3',
        },
        yellow: {
          DEFAULT: '#FFCA28',
        },
        dark: {
          DEFAULT: '#1a1a2e',
          card: '#1e293b',
          border: '#334155',
          muted: '#94a3b8',
        },
        cream: '#FFF5FA',
        admin: {
          bg: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          muted: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['var(--font-system)', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        pink: '0 4px 20px rgba(233, 30, 140, 0.25)',
        'pink-lg': '0 8px 40px rgba(233, 30, 140, 0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 4: Configurar CSS global con variables de marca**

Reemplazar `src/styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --pink: #E91E8C;
  --pink-lt: #FF6BB3;
  --yellow: #FFCA28;
  --dark: #1a1a2e;
  --cream: #FFF5FA;
}

body {
  background-color: var(--cream);
  color: var(--dark);
}

@layer components {
  .btn-primary {
    @apply bg-gradient-to-r from-pink to-pink-light text-white font-bold py-3 px-6 rounded-full shadow-pink hover:shadow-pink-lg transition-all duration-200 active:scale-95;
  }
  .btn-ghost {
    @apply border-2 border-pink text-pink font-bold py-3 px-6 rounded-full hover:bg-pink hover:text-white transition-all duration-200;
  }
  .card-product {
    @apply bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-pink transition-shadow duration-200;
  }
}
```

- [ ] **Step 5: Configurar next.config.ts**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 6: Crear .env.local con template**

```bash
# Database
DATABASE_URL="postgresql://usuario:password@localhost:5432/novedades_guera"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# NextAuth
NEXTAUTH_SECRET="genera-un-secret-aleatorio-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

- [ ] **Step 7: Crear singleton Prisma**

Crear `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['query'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 8: Crear singleton Stripe (server)**

Crear `src/lib/stripe.ts`:

```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: bootstrap Next.js 14 + Tailwind brand tokens + lib singletons"
```

---

## Task 2: Esquema Prisma y base de datos

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Inicializar Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 2: Escribir el esquema completo**

Reemplazar `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Category {
  BELLEZA
  ACCESORIOS
  HOGAR
  DULCERIA
  NOVEDADES
}

enum ProductBadge {
  NUEVO
  OFERTA
  MAYOREO
}

enum OrderStatus {
  PENDING
  PREPARING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum DeliveryType {
  LOCAL
  PAQUETERIA
  RECOGER
}

model Product {
  id            String       @id @default(cuid())
  name          String
  slug          String       @unique
  description   String?
  category      Category
  badge         ProductBadge?
  imageUrl      String
  priceRetail   Int          // centavos MXN
  priceWholesale Int?        // centavos MXN, null si no tiene mayoreo
  wholesaleMin  Int?         // mínimo de piezas para mayoreo
  stock         Int          @default(0)
  active        Boolean      @default(true)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  orderItems    OrderItem[]
}

model Order {
  id             String       @id @default(cuid())
  customerName   String
  customerPhone  String
  customerEmail  String
  street         String
  colonia        String
  postalCode     String
  city           String
  state          String
  references     String?
  deliveryType   DeliveryType
  deliveryCost   Int          // centavos MXN
  subtotal       Int          // centavos MXN
  total          Int          // centavos MXN
  status         OrderStatus  @default(PENDING)
  stripePaymentIntentId String? @unique
  paidAt         DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  items          OrderItem[]
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  unitPrice Int     // precio al momento de la compra (centavos)
  order     Order   @relation(fields: [orderId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
}

model Review {
  id          String   @id @default(cuid())
  customerName String
  rating      Int      // 1-5
  text        String
  productName String
  avatarColor String   // hex color para avatar placeholder
  verified    Boolean  @default(true)
  createdAt   DateTime @default(now())
}

model AdminUser {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hash
  name      String
  createdAt DateTime @default(now())
}
```

- [ ] **Step 3: Generar cliente Prisma y aplicar migración**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Resultado esperado: carpeta `prisma/migrations/` creada, tablas en la base de datos.

- [ ] **Step 4: Crear seed con datos de prueba**

Crear `prisma/seed.ts`:

```typescript
import { PrismaClient, Category, ProductBadge, DeliveryType, OrderStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  await prisma.adminUser.upsert({
    where: { email: 'admin@novedadeslagueraa.com' },
    update: {},
    create: {
      email: 'admin@novedadeslagueraa.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'La Güera',
    },
  })

  // Productos de ejemplo
  const products = [
    {
      name: 'Set de Sombras Glam',
      slug: 'set-sombras-glam',
      description: 'Paleta de 12 sombras con acabados mate y brillantes',
      category: Category.BELLEZA,
      badge: ProductBadge.NUEVO,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/food/pot-mussels',
      priceRetail: 18000,
      priceWholesale: 14000,
      wholesaleMin: 6,
      stock: 50,
    },
    {
      name: 'Aretes Flor Dorada',
      slug: 'aretes-flor-dorada',
      description: 'Aretes de moda con diseño floral dorado',
      category: Category.ACCESORIOS,
      badge: ProductBadge.OFERTA,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/food/pot-mussels',
      priceRetail: 8500,
      priceWholesale: 6000,
      wholesaleMin: 12,
      stock: 100,
    },
    {
      name: 'Dulces Surtidos Bolsa',
      slug: 'dulces-surtidos-bolsa',
      description: 'Bolsa surtida con 50 piezas de dulces mexicanos',
      category: Category.DULCERIA,
      badge: ProductBadge.MAYOREO,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/food/pot-mussels',
      priceRetail: 5000,
      priceWholesale: 3500,
      wholesaleMin: 10,
      stock: 200,
    },
    {
      name: 'Portavelas Decorativo',
      slug: 'portavelas-decorativo',
      description: 'Portavelas de cerámica con diseño floral',
      category: Category.HOGAR,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/food/pot-mussels',
      priceRetail: 22000,
      stock: 30,
    },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    })
  }

  // Reviews de ejemplo
  const reviews = [
    {
      customerName: 'María G.',
      rating: 5,
      text: 'Llegó súper rápido y todo perfecto. Los aretes son hermosos, igual que en la foto.',
      productName: 'Aretes Flor Dorada',
      avatarColor: '#E91E8C',
    },
    {
      customerName: 'Sofía R.',
      rating: 5,
      text: 'Compré los dulces para el cumple de mi hija y todos quedaron encantados. Volvería a comprar.',
      productName: 'Dulces Surtidos Bolsa',
      avatarColor: '#FFCA28',
    },
    {
      customerName: 'Laura M.',
      rating: 4,
      text: 'Excelente calidad y precio. El envío tardó un día más pero avisaron por WhatsApp.',
      productName: 'Set de Sombras Glam',
      avatarColor: '#FF6BB3',
    },
  ]

  for (const r of reviews) {
    await prisma.review.create({ data: r })
  }

  console.log('Seed completado.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Añadir a `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Instalar dependencia:
```bash
npm install bcryptjs @types/bcryptjs ts-node --save-dev
```

Ejecutar seed:
```bash
npx prisma db seed
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: prisma schema + migration + seed data"
```

---

## Task 3: Tipos compartidos y store del carrito

**Files:**
- Create: `src/types/index.ts`
- Create: `src/store/cart.ts`

- [ ] **Step 1: Definir tipos compartidos**

Crear `src/types/index.ts`:

```typescript
import { Category, DeliveryType, OrderStatus } from '@prisma/client'

export type { Category, DeliveryType, OrderStatus }

export interface CartItem {
  productId: string
  name: string
  imageUrl: string
  category: Category
  priceRetail: number    // centavos
  priceWholesale: number | null
  wholesaleMin: number | null
  quantity: number
  slug: string
}

export interface CheckoutFormData {
  // Paso 1
  customerName: string
  customerPhone: string
  customerEmail: string
  // Paso 2
  street: string
  colonia: string
  postalCode: string
  city: string
  state: string
  references: string
  deliveryType: DeliveryType
}

export interface ProductPublic {
  id: string
  name: string
  slug: string
  description: string | null
  category: Category
  badge: string | null
  imageUrl: string
  priceRetail: number
  priceWholesale: number | null
  wholesaleMin: number | null
  stock: number
}

export interface OrderPublic {
  id: string
  customerName: string
  deliveryType: DeliveryType
  status: OrderStatus
  total: number
  createdAt: string
  items: {
    quantity: number
    unitPrice: number
    product: { name: string; imageUrl: string }
  }[]
}

export const DELIVERY_COSTS: Record<DeliveryType, number> = {
  LOCAL: 5000,       // $50 MXN en centavos
  PAQUETERIA: 12000, // $120 MXN en centavos
  RECOGER: 0,
}

export const DELIVERY_LABELS: Record<DeliveryType, string> = {
  LOCAL: 'Entrega local Juárez',
  PAQUETERIA: 'Paquetería nacional',
  RECOGER: 'Recoger en tienda',
}

export const CATEGORY_COLORS: Record<string, string> = {
  BELLEZA: 'bg-pink/10',
  ACCESORIOS: 'bg-yellow/20',
  HOGAR: 'bg-green-100',
  DULCERIA: 'bg-pink-light/10',
  NOVEDADES: 'bg-purple-100',
}

export const CATEGORY_LABELS: Record<string, string> = {
  BELLEZA: 'Belleza',
  ACCESORIOS: 'Accesorios',
  HOGAR: 'Hogar',
  DULCERIA: 'Dulcería',
  NOVEDADES: 'Novedades',
}
```

- [ ] **Step 2: Crear store del carrito con Zustand**

Crear `src/store/cart.ts`:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  subtotal: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === newItem.productId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === newItem.productId
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, newItem] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.priceRetail * i.quantity, 0),
    }),
    {
      name: 'guera-cart',
    }
  )
)
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: shared types + zustand cart store with persistence"
```

---

## Task 4: Componentes UI reutilizables

**Files:**
- Create: `src/components/ui/ProductCard.tsx`
- Create: `src/components/ui/CategoryChip.tsx`
- Create: `src/components/ui/OrderStatusBadge.tsx`
- Create: `src/components/ui/DeliveryOption.tsx`
- Create: `src/components/ui/Navbar.tsx`
- Create: `src/components/ui/Footer.tsx`

- [ ] **Step 1: ProductCard**

Crear `src/components/ui/ProductCard.tsx`:

```typescript
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { ProductPublic, CATEGORY_COLORS, CATEGORY_LABELS } from '@/types'
import { useCart } from '@/store/cart'

interface ProductCardProps {
  product: ProductPublic
}

const BADGE_STYLES: Record<string, string> = {
  NUEVO: 'bg-pink text-white',
  OFERTA: 'bg-yellow text-dark',
  MAYOREO: 'bg-dark text-white',
}

const BADGE_LABELS: Record<string, string> = {
  NUEVO: 'NUEVO',
  OFERTA: 'OFERTA',
  MAYOREO: 'MAYOREO',
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((s) => s.addItem)

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      category: product.category,
      priceRetail: product.priceRetail,
      priceWholesale: product.priceWholesale,
      wholesaleMin: product.wholesaleMin,
      quantity: 1,
      slug: product.slug,
    })
  }

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)

  return (
    <div className="card-product relative flex flex-col">
      {/* Badge */}
      {product.badge && (
        <span
          className={`absolute top-3 left-3 z-10 text-xs font-bold px-2 py-1 rounded-full ${BADGE_STYLES[product.badge]}`}
        >
          {BADGE_LABELS[product.badge]}
        </span>
      )}

      {/* Wishlist */}
      <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:text-pink transition-colors">
        <Heart size={16} />
      </button>

      {/* Imagen */}
      <Link href={`/productos/${product.slug}`}>
        <div className={`relative h-48 ${CATEGORY_COLORS[product.category] ?? 'bg-gray-100'}`}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-4"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-xs text-dark/50 font-medium uppercase tracking-wide">
          {CATEGORY_LABELS[product.category]}
        </span>
        <Link href={`/productos/${product.slug}`}>
          <h3 className="font-bold text-dark text-sm leading-tight hover:text-pink transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.priceWholesale && product.wholesaleMin && (
          <p className="text-xs text-pink-light font-medium">
            Mayoreo {product.wholesaleMin}+ piezas: {formatPrice(product.priceWholesale)} c/u
          </p>
        )}

        <p className="text-xl font-black text-pink">{formatPrice(product.priceRetail)}</p>

        <button
          onClick={handleAdd}
          className="mt-auto btn-primary flex items-center justify-center gap-2 text-sm py-2"
        >
          <ShoppingCart size={16} />
          Agregar al carrito
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: CategoryChip**

Crear `src/components/ui/CategoryChip.tsx`:

```typescript
'use client'

interface CategoryChipProps {
  label: string
  active: boolean
  onClick: () => void
  color?: string
}

export default function CategoryChip({ label, active, onClick, color }: CategoryChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
        active
          ? 'bg-pink text-white shadow-pink'
          : 'bg-white text-dark border border-dark/10 hover:border-pink hover:text-pink'
      }`}
      style={active && color ? { backgroundColor: color } : undefined}
    >
      {label}
    </button>
  )
}
```

- [ ] **Step 3: OrderStatusBadge**

Crear `src/components/ui/OrderStatusBadge.tsx`:

```typescript
import { OrderStatus } from '@/types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; class: string; icon: string }> = {
  PENDING:    { label: 'Nuevo',       class: 'bg-blue-100 text-blue-700',   icon: '🔵' },
  PREPARING:  { label: 'En proceso',  class: 'bg-yellow/20 text-yellow-700', icon: '🟡' },
  SHIPPED:    { label: 'Enviado',     class: 'bg-purple-100 text-purple-700', icon: '🚀' },
  DELIVERED:  { label: 'Entregado',   class: 'bg-green-100 text-green-700',  icon: '✅' },
  CANCELLED:  { label: 'Cancelado',   class: 'bg-red-100 text-red-700',     icon: '❌' },
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, class: cls, icon } = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {icon} {label}
    </span>
  )
}
```

- [ ] **Step 4: DeliveryOption**

Crear `src/components/ui/DeliveryOption.tsx`:

```typescript
import { DeliveryType, DELIVERY_COSTS, DELIVERY_LABELS } from '@/types'

const DELIVERY_DESCRIPTIONS: Record<DeliveryType, string> = {
  LOCAL:       'Mismo día en Juárez, N.L.',
  PAQUETERIA:  'República mexicana 3-5 días hábiles',
  RECOGER:     'Arturo B. de la Garza #108, Juárez N.L.',
}

interface DeliveryOptionProps {
  type: DeliveryType
  selected: boolean
  onSelect: (type: DeliveryType) => void
}

export default function DeliveryOption({ type, selected, onSelect }: DeliveryOptionProps) {
  const cost = DELIVERY_COSTS[type]
  const formatPrice = (cents: number) =>
    cents === 0
      ? 'Gratis'
      : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)

  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
        selected ? 'border-pink bg-pink/5' : 'border-dark/10 hover:border-pink/40'
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          selected ? 'border-pink' : 'border-dark/30'
        }`}
      >
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-pink" />}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-dark text-sm">{DELIVERY_LABELS[type]}</p>
        <p className="text-xs text-dark/50">{DELIVERY_DESCRIPTIONS[type]}</p>
      </div>
      <span className={`font-bold text-sm ${cost === 0 ? 'text-green-600' : 'text-dark'}`}>
        {formatPrice(cost)}
      </span>
    </button>
  )
}
```

- [ ] **Step 5: Navbar**

Crear `src/components/ui/Navbar.tsx`:

```typescript
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Search, Menu, X } from 'lucide-react'
import { useCart } from '@/store/cart'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/productos?cat=BELLEZA', label: 'Belleza' },
  { href: '/productos?cat=ACCESORIOS', label: 'Accesorios' },
  { href: '/productos?cat=HOGAR', label: 'Hogar' },
  { href: '/productos?cat=DULCERIA', label: 'Dulcería' },
  { href: '/productos?cat=NOVEDADES', label: 'Novedades' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const totalItems = useCart((s) => s.totalItems())

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink to-pink-light flex items-center justify-center text-white font-black text-sm">
            LG
          </div>
          <div className="hidden sm:block">
            <p className="font-black text-dark text-sm leading-none">Novedades</p>
            <p className="font-black text-pink text-sm leading-none">La Güera</p>
          </div>
        </Link>

        {/* Nav links desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-dark/70 hover:text-pink transition-colors rounded-lg hover:bg-pink/5"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/productos?badge=OFERTA"
            className="px-3 py-1.5 text-sm font-bold text-white bg-pink rounded-full ml-1 hover:bg-pink/90 transition-colors"
          >
            OFERTAS
          </Link>
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-pink/5 text-dark/70 hover:text-pink transition-colors">
            <Search size={20} />
          </button>

          <Link href="/carrito" className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-pink/5 text-dark/70 hover:text-pink transition-colors">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-yellow text-dark text-xs font-black rounded-full flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>

          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-pink/5 text-dark hover:text-pink transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-dark/5 px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-2 px-3 text-sm font-medium text-dark/70 hover:text-pink rounded-lg hover:bg-pink/5"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
```

- [ ] **Step 6: Footer**

Crear `src/components/ui/Footer.tsx`:

```typescript
import Link from 'next/link'
import { Instagram, Facebook } from 'lucide-react'

const STORE_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Catálogo' },
  { href: '/productos?badge=OFERTA', label: 'Ofertas' },
  { href: '/productos?mayoreo=true', label: 'Mayoreo' },
]

const HELP_LINKS = [
  { href: '/seguimiento', label: 'Rastrear pedido' },
  { href: '/ayuda', label: 'Preguntas frecuentes' },
  { href: '/privacidad', label: 'Política de privacidad' },
  { href: '/terminos', label: 'Términos de uso' },
]

export default function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Columna 1: Marca + Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink to-pink-light flex items-center justify-center text-white font-black text-sm">
                LG
              </div>
              <div>
                <p className="font-black text-sm leading-none">Novedades</p>
                <p className="font-black text-pink text-sm leading-none">La Güera</p>
              </div>
            </div>
            <p className="text-dark-muted text-sm mb-4">
              ¡Todo lo que necesitas, al mejor precio! Belleza, accesorios, hogar, dulcería y más.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Tu correo"
                className="flex-1 px-3 py-2 rounded-lg bg-dark-card text-white text-sm border border-dark-border focus:border-pink outline-none"
              />
              <button className="btn-primary py-2 px-4 text-sm rounded-lg">
                Suscribir
              </button>
            </div>
          </div>

          {/* Columna 2: Tienda */}
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wide">Tienda</h4>
            <ul className="space-y-2">
              {STORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-dark-muted text-sm hover:text-pink transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Ayuda */}
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wide">Ayuda</h4>
            <ul className="space-y-2">
              {HELP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-dark-muted text-sm hover:text-pink transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wide">Contacto</h4>
            <address className="not-italic text-dark-muted text-sm space-y-2">
              <p>📍 Arturo B. de la Garza #108</p>
              <p>Juárez, Nuevo León</p>
              <p className="mt-3">🕐 Lun–Vie 9am–7pm</p>
              <p>Sáb 9am–4pm</p>
              <p className="text-pink font-medium">Pedidos online 24/7</p>
            </address>
            <div className="flex gap-3 mt-4">
              <a
                href="https://instagram.com/novedadeslagueraa"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-dark-card rounded-full flex items-center justify-center text-dark-muted hover:text-pink transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-dark-card rounded-full flex items-center justify-center text-dark-muted hover:text-pink transition-colors"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-dark-border px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-dark-muted">
          <p>© 2026 Novedades La Güera. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>Pagos seguros con</span>
            <span className="font-bold text-white">Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 7: Instalar lucide-react**

```bash
npm install lucide-react
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: shared UI components - ProductCard, Navbar, Footer, badges"
```

---

## Task 5: Secciones del Home

**Files:**
- Create: `src/components/home/Hero.tsx`
- Create: `src/components/home/FeaturedProducts.tsx`
- Create: `src/components/home/TrustStrip.tsx`
- Create: `src/components/home/MayoreoBanner.tsx`
- Create: `src/components/home/StripeSeal.tsx`
- Create: `src/components/home/Testimonials.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Root layout**

Reemplazar `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import './globals.css'  // ajusta según tu estructura
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

export const metadata: Metadata = {
  title: 'Novedades La Güera — Belleza, Accesorios y Más',
  description: '¡Todo lo que necesitas, al mejor precio! Tienda online con envío a Juárez y toda la república.',
  manifest: '/manifest.json',
  themeColor: '#E91E8C',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-cream text-dark antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Hero**

Crear `src/components/home/Hero.tsx`:

```typescript
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream py-10 lg:py-20">
      {/* Blobs decorativos */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-8">
        {/* Texto */}
        <div className="flex-1 text-center lg:text-left">
          <span className="inline-block px-4 py-1.5 bg-pink/10 text-pink font-semibold text-sm rounded-full mb-4">
            ✨ Colección Primavera 2026
          </span>
          <h1 className="text-4xl lg:text-6xl font-black text-dark leading-tight mb-4">
            Todo lo que <span className="text-pink">necesitas</span>,<br />
            al mejor precio
          </h1>
          <p className="text-dark/60 text-lg mb-8 max-w-md mx-auto lg:mx-0">
            Belleza, accesorios, hogar, dulcería y novedades. Entrega en Juárez y toda la república.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link href="/productos" className="btn-primary text-center">
              Ver catálogo
            </Link>
            <Link href="/productos?mayoreo=true" className="btn-ghost text-center">
              Precios mayoreo
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-8 justify-center lg:justify-start">
            <div className="text-center">
              <p className="text-2xl font-black text-pink">500+</p>
              <p className="text-xs text-dark/50">Productos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-pink">1K+</p>
              <p className="text-xs text-dark/50">Clientes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-pink">4.9★</p>
              <p className="text-xs text-dark/50">Calificación</p>
            </div>
          </div>
        </div>

        {/* Mascota placeholder + badges flotantes */}
        <div className="relative flex-1 flex items-center justify-center">
          <div className="w-64 h-64 lg:w-80 lg:h-80 bg-gradient-to-br from-pink/20 to-yellow/20 rounded-full flex items-center justify-center">
            <span className="text-8xl">👱‍♀️</span>
          </div>
          {/* Badge flotante */}
          <div className="absolute top-4 right-8 bg-white rounded-2xl shadow-pink px-3 py-2 text-xs font-bold text-dark">
            🚀 Envío express
          </div>
          <div className="absolute bottom-8 left-4 bg-dark text-white rounded-2xl px-3 py-2 text-xs font-bold">
            💳 Pago con Stripe
          </div>
          <div className="absolute bottom-16 right-2 bg-yellow rounded-2xl px-3 py-2 text-xs font-bold text-dark">
            🏪 Mayoreo · Menudeo
          </div>
        </div>
      </div>

      {/* Barra de categorías */}
      <div className="mt-10 border-t border-dark/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { label: '💄 Belleza', href: '/productos?cat=BELLEZA', bg: 'bg-dark text-white' },
            { label: '💍 Accesorios', href: '/productos?cat=ACCESORIOS', bg: 'bg-pink text-white' },
            { label: '🏠 Hogar', href: '/productos?cat=HOGAR', bg: 'bg-pink-light text-white' },
            { label: '🍬 Dulcería', href: '/productos?cat=DULCERIA', bg: 'bg-yellow text-dark' },
            { label: '✨ Novedades', href: '/productos?cat=NOVEDADES', bg: 'bg-pink/80 text-white' },
          ].map((cat) => (
            <a
              key={cat.href}
              href={cat.href}
              className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-opacity hover:opacity-80 ${cat.bg}`}
            >
              {cat.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: FeaturedProducts**

Crear `src/components/home/FeaturedProducts.tsx`:

```typescript
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ui/ProductCard'
import Link from 'next/link'

export default async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { active: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-pink font-semibold text-sm mb-2">— Nuestra selección —</p>
          <h2 className="text-3xl lg:text-4xl font-black text-dark mb-3">
            Productos <span className="text-pink">Destacados</span>
          </h2>
          <p className="text-dark/50 max-w-md mx-auto">
            Lo más popular de la tienda, seleccionado especialmente para ti.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/productos" className="btn-ghost inline-block">
            Ver catálogo completo →
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: TrustStrip**

Crear `src/components/home/TrustStrip.tsx`:

```typescript
const BENEFITS = [
  { icon: '🚀', title: 'Envío Rápido', desc: 'Juárez mismo día · República 3-5 días' },
  { icon: '⭐', title: 'Calidad Garantizada', desc: 'Productos seleccionados con amor' },
  { icon: '🔒', title: 'Pago Seguro', desc: 'Procesado por Stripe' },
  { icon: '💰', title: 'Precios Bajos', desc: 'Mayoreo y menudeo disponible' },
]

export default function TrustStrip() {
  return (
    <section className="bg-white py-10 border-y border-dark/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
              <span className="text-3xl">{b.icon}</span>
              <div>
                <p className="font-bold text-dark text-sm">{b.title}</p>
                <p className="text-dark/50 text-xs">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: MayoreoBanner**

Crear `src/components/home/MayoreoBanner.tsx`:

```typescript
import Link from 'next/link'

const CHECKS = [
  'Precios desde 6 piezas por artículo',
  'Surtido amplio en todas las categorías',
  'Envío especial para pedidos grandes',
  'Atención personalizada por WhatsApp',
]

const STATS = [
  { value: '1K+', label: 'Clientes mayoreo' },
  { value: '500+', label: 'Productos disponibles' },
  { value: '4.9★', label: 'Calificación' },
  { value: '3 años', label: 'En el mercado' },
]

export default function MayoreoBanner() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-dark to-[#2d1b4e] rounded-3xl overflow-hidden relative">
          {/* Blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow/10 rounded-full blur-2xl" />

          <div className="relative p-8 lg:p-12 flex flex-col lg:flex-row gap-10">
            {/* Texto */}
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-yellow text-dark text-xs font-bold rounded-full mb-4">
                ⭐ Programa Mayoreo
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-white mb-2">
                Precios especiales<br />
                para <span className="text-yellow">revendedores</span>
              </h2>
              <p className="text-white/60 mb-6">Compra en cantidad y maximiza tus ganancias.</p>
              <ul className="space-y-3 mb-8">
                {CHECKS.map((check) => (
                  <li key={check} className="flex items-center gap-2 text-white/80 text-sm">
                    <span className="text-yellow">✦</span> {check}
                  </li>
                ))}
              </ul>
              <Link href="/productos?mayoreo=true" className="btn-primary inline-block">
                Ver precios mayoreo →
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-6 lg:w-64">
              <div className="grid grid-cols-2 gap-4">
                {STATS.map((s) => (
                  <div key={s.label} className="bg-white/5 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-black text-yellow">{s.value}</p>
                    <p className="text-white/50 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <p className="text-white font-bold text-sm mb-3">¿Cómo ordenar?</p>
                {['1. Elige tus productos', '2. Agrega al carrito', '3. Paga con Stripe'].map((step) => (
                  <p key={step} className="text-white/50 text-xs py-1 border-b border-white/5 last:border-0">
                    {step}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: StripeSeal**

Crear `src/components/home/StripeSeal.tsx`:

```typescript
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
```

- [ ] **Step 7: Testimonials**

Crear `src/components/home/Testimonials.tsx`:

```typescript
import { prisma } from '@/lib/prisma'

export default async function Testimonials() {
  const reviews = await prisma.review.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-pink font-semibold text-sm mb-2">— Lo que dicen nuestros clientes —</p>
          <h2 className="text-3xl font-black text-dark mb-2">
            <span className="text-pink text-5xl font-black">4.9</span> de 5 estrellas
          </h2>
          <p className="text-dark/50">Basado en más de 200 reseñas verificadas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-cream rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: review.avatarColor }}
                >
                  {review.customerName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-dark text-sm">{review.customerName}</p>
                  <p className="text-yellow text-xs">{'★'.repeat(review.rating)}</p>
                </div>
                <span className="ml-auto text-xs text-green-600 font-medium">✓ Verificada</span>
              </div>
              <p className="text-dark/70 text-sm leading-relaxed mb-3">{review.text}</p>
              <span className="text-xs bg-pink/10 text-pink px-2 py-1 rounded-full font-medium">
                {review.productName}
              </span>
            </div>
          ))}
        </div>

        {/* Instagram strip */}
        <div className="mt-10 bg-gradient-to-r from-pink to-pink-light rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="text-white text-center sm:text-left">
            <p className="font-black text-xl mb-1">Síguenos en Instagram</p>
            <p className="text-white/80 text-sm">@novedadeslagueraa · Contenido nuevo cada día</p>
          </div>
          <a
            href="https://instagram.com/novedadeslagueraa"
            target="_blank"
            rel="noreferrer"
            className="sm:ml-auto bg-white text-pink font-bold px-6 py-2.5 rounded-full hover:bg-pink/10 hover:text-white transition-colors"
          >
            Seguir
          </a>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 8: Home page**

Reemplazar `src/app/page.tsx`:

```typescript
import Hero from '@/components/home/Hero'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import TrustStrip from '@/components/home/TrustStrip'
import Mayoreobanner from '@/components/home/MayoreoBanner'
import StripeSeal from '@/components/home/StripeSeal'
import Testimonials from '@/components/home/Testimonials'

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <FeaturedProducts />
      <MayoreobannerBanner />
      <StripeSeal />
      <Testimonials />
    </>
  )
}
```

- [ ] **Step 9: Ejecutar dev server y verificar que carga**

```bash
npm run dev
```

Abrir http://localhost:3000. Verificar:
- Navbar muestra logo, links y carrito
- Hero muestra headline, botones y stats
- Trust strip muestra 4 beneficios
- Productos destacados carga desde DB (seed)
- Footer oscuro con 4 columnas

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: home page - Hero, Featured Products, Trust, Mayoreo, Testimonials"
```

---

## Task 6: API Routes — Productos y Pedidos

**Files:**
- Create: `src/app/api/products/route.ts`
- Create: `src/app/api/orders/[id]/route.ts`

- [ ] **Step 1: GET /api/products**

Crear `src/app/api/products/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Category, ProductBadge } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cat = searchParams.get('cat')
  const badge = searchParams.get('badge')
  const mayoreo = searchParams.get('mayoreo')
  const search = searchParams.get('q')
  const take = parseInt(searchParams.get('take') ?? '20')

  const where: Record<string, unknown> = { active: true }

  if (cat && Object.values(Category).includes(cat as Category)) {
    where.category = cat as Category
  }
  if (badge && Object.values(ProductBadge).includes(badge as ProductBadge)) {
    where.badge = badge as ProductBadge
  }
  if (mayoreo === 'true') {
    where.priceWholesale = { not: null }
  }
  if (search) {
    where.name = { contains: search, mode: 'insensitive' }
  }

  const products = await prisma.product.findMany({
    where,
    take,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      badge: true,
      imageUrl: true,
      priceRetail: true,
      priceWholesale: true,
      wholesaleMin: true,
      stock: true,
    },
  })

  return NextResponse.json(products)
}
```

- [ ] **Step 2: GET /api/orders/[id]**

Crear `src/app/api/orders/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, imageUrl: true, slug: true },
          },
        },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  return NextResponse.json(order)
}
```

- [ ] **Step 3: Probar endpoints**

```bash
# En otra terminal mientras corre npm run dev
curl "http://localhost:3000/api/products"
curl "http://localhost:3000/api/products?cat=BELLEZA"
```

Resultado esperado: array JSON con los productos del seed.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: api routes - GET /api/products, GET /api/orders/[id]"
```

---

## Task 7: Página de Catálogo

**Files:**
- Create: `src/app/productos/page.tsx`

- [ ] **Step 1: Página de catálogo con filtros**

Crear `src/app/productos/page.tsx`:

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/ui/ProductCard'
import CategoryChip from '@/components/ui/CategoryChip'
import { ProductPublic, CATEGORY_LABELS } from '@/types'

const CATEGORIES = ['TODO', 'BELLEZA', 'ACCESORIOS', 'HOGAR', 'DULCERIA', 'NOVEDADES']

export default function CatalogPage() {
  const searchParams = useSearchParams()
  const initialCat = searchParams.get('cat') ?? 'TODO'

  const [activeCategory, setActiveCategory] = useState(initialCat)
  const [products, setProducts] = useState<ProductPublic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (activeCategory !== 'TODO') params.set('cat', activeCategory)
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data)
        setLoading(false)
      })
  }, [activeCategory])

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-dark mb-6">
        Catálogo <span className="text-pink">completo</span>
      </h1>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat}
            label={cat === 'TODO' ? 'Todo' : CATEGORY_LABELS[cat]}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          />
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 bg-dark/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-dark/40">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-bold">No hay productos en esta categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar en el browser**

Con `npm run dev` corriendo:
- Abrir http://localhost:3000/productos
- Cambiar entre filtros y verificar que el grid se actualiza
- Verificar skeleton loading

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: catalog page with category filters"
```

---

## Task 8: Página de detalle de producto

**Files:**
- Create: `src/app/productos/[slug]/page.tsx`

- [ ] **Step 1: Página de producto**

Crear `src/app/productos/[slug]/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import AddToCartButton from './AddToCartButton'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types'

interface Props {
  params: { slug: string }
}

export default async function ProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, active: true },
  })

  if (!product) notFound()

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Imagen */}
        <div className={`relative h-80 lg:h-96 rounded-3xl overflow-hidden ${CATEGORY_COLORS[product.category] ?? 'bg-gray-100'}`}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-8"
            priority
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <span className="text-sm text-dark/50 font-medium uppercase tracking-wide">
            {CATEGORY_LABELS[product.category]}
          </span>
          <h1 className="text-3xl font-black text-dark">{product.name}</h1>

          {product.description && (
            <p className="text-dark/60 leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-end gap-3">
            <p className="text-4xl font-black text-pink">{formatPrice(product.priceRetail)}</p>
            <span className="text-sm text-dark/40 mb-1">por pieza</span>
          </div>

          {product.priceWholesale && product.wholesaleMin && (
            <div className="bg-pink/5 border border-pink/20 rounded-2xl p-4">
              <p className="text-sm font-bold text-pink mb-1">💰 Precio mayoreo</p>
              <p className="text-2xl font-black text-dark">{formatPrice(product.priceWholesale)}</p>
              <p className="text-xs text-dark/50 mt-1">
                A partir de {product.wholesaleMin} piezas
              </p>
            </div>
          )}

          <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `✓ ${product.stock} disponibles` : '✗ Sin stock'}
          </p>

          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Botón "Agregar al carrito" (client component)**

Crear `src/app/productos/[slug]/AddToCartButton.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/store/cart'
import { Product } from '@prisma/client'

export default function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1)
  const addItem = useCart((s) => s.addItem)

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      category: product.category,
      priceRetail: product.priceRetail,
      priceWholesale: product.priceWholesale,
      wholesaleMin: product.wholesaleMin,
      quantity: qty,
      slug: product.slug,
    })
  }

  return (
    <div className="flex flex-col gap-3 mt-2">
      {/* Selector de cantidad */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-dark/60">Cantidad:</span>
        <div className="flex items-center border border-dark/10 rounded-xl overflow-hidden">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-pink/5 font-bold text-dark"
          >
            −
          </button>
          <span className="w-10 text-center font-bold text-dark">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-pink/5 font-bold text-dark"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={product.stock === 0}
        className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingCart size={18} />
        Agregar al carrito
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: product detail page with add-to-cart"
```

---

## Task 9: Página del carrito

**Files:**
- Create: `src/app/carrito/page.tsx`
- Create: `src/components/cart/CartItem.tsx`

- [ ] **Step 1: CartItem component**

Crear `src/components/cart/CartItem.tsx`:

```typescript
'use client'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { useCart } from '@/store/cart'
import { CartItem as CartItemType, CATEGORY_COLORS } from '@/types'

export default function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCart()

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)

  return (
    <div className="flex gap-4 py-4 border-b border-dark/5">
      <div className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 ${CATEGORY_COLORS[item.category] ?? 'bg-gray-100'}`}>
        <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-2" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-dark text-sm leading-tight">{item.name}</p>
        {item.priceWholesale && item.wholesaleMin && item.quantity >= item.wholesaleMin && (
          <p className="text-xs text-pink-light mt-0.5">
            Precio mayoreo aplicado
          </p>
        )}
        <p className="text-pink font-bold mt-1">
          {formatPrice(item.priceRetail)} c/u
        </p>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center border border-dark/10 rounded-xl overflow-hidden">
            <button
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-pink/5 font-bold"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-pink/5 font-bold"
            >
              +
            </button>
          </div>
          <button
            onClick={() => removeItem(item.productId)}
            className="text-dark/30 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="font-black text-dark">
          {formatPrice(item.priceRetail * item.quantity)}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Carrito page**

Crear `src/app/carrito/page.tsx`:

```typescript
'use client'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/store/cart'
import CartItem from '@/components/cart/CartItem'

export default function CartPage() {
  const { items, subtotal } = useCart()

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="text-dark/20 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-dark mb-2">Tu carrito está vacío</h1>
        <p className="text-dark/50 mb-8">Agrega productos para comenzar</p>
        <Link href="/productos" className="btn-primary inline-block">
          Ver catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-dark mb-8">
        Tu carrito <span className="text-pink">({items.length} producto{items.length !== 1 ? 's' : ''})</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1">
          {items.map((item) => (
            <CartItem key={item.productId} item={item} />
          ))}
        </div>

        {/* Resumen */}
        <div className="lg:w-80">
          <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-24">
            <h2 className="font-black text-dark text-lg mb-4">Resumen</h2>
            <div className="flex justify-between text-sm text-dark/60 mb-2">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal())}</span>
            </div>
            <div className="flex justify-between text-sm text-dark/60 mb-4">
              <span>Envío</span>
              <span>Se calcula en checkout</span>
            </div>
            <div className="border-t border-dark/5 pt-4 flex justify-between font-black text-dark text-lg mb-6">
              <span>Total estimado</span>
              <span className="text-pink">{formatPrice(subtotal())}</span>
            </div>
            <Link href="/checkout" className="btn-primary block text-center">
              Proceder al pago →
            </Link>
            <Link
              href="/productos"
              className="block text-center text-sm text-dark/50 hover:text-pink mt-3 transition-colors"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: cart page with item management and order summary"
```

---

## Task 10: Checkout — API y Stripe PaymentIntent

**Files:**
- Create: `src/app/api/checkout/route.ts`
- Create: `src/app/api/webhooks/stripe/route.ts`

- [ ] **Step 1: POST /api/checkout — crear PaymentIntent + pedido pending**

Crear `src/app/api/checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { z } from 'zod'
import { DeliveryType } from '@prisma/client'
import { DELIVERY_COSTS } from '@/types'

const CheckoutSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(10),
  customerEmail: z.string().email(),
  street: z.string().min(3),
  colonia: z.string().min(2),
  postalCode: z.string().length(5),
  city: z.string().min(2),
  state: z.string().min(2),
  references: z.string().optional().default(''),
  deliveryType: z.nativeEnum(DeliveryType),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = CheckoutSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data

  // Verificar stock y calcular subtotal
  const productIds = data.items.map((i) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  })

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'Uno o más productos no están disponibles' }, { status: 400 })
  }

  let subtotal = 0
  const orderItems = data.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!
    if (product.stock < item.quantity) {
      throw new Error(`Stock insuficiente para ${product.name}`)
    }
    const unitPrice = product.priceRetail
    subtotal += unitPrice * item.quantity
    return { productId: item.productId, quantity: item.quantity, unitPrice }
  })

  const deliveryCost = DELIVERY_COSTS[data.deliveryType]
  const total = subtotal + deliveryCost

  // Crear pedido en estado PENDING
  const order = await prisma.order.create({
    data: {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      street: data.street,
      colonia: data.colonia,
      postalCode: data.postalCode,
      city: data.city,
      state: data.state,
      references: data.references,
      deliveryType: data.deliveryType,
      deliveryCost,
      subtotal,
      total,
      status: 'PENDING',
      items: { create: orderItems },
    },
  })

  // Crear PaymentIntent en Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: total, // centavos MXN
    currency: 'mxn',
    metadata: { orderId: order.id },
    automatic_payment_methods: { enabled: true },
  })

  // Guardar el PaymentIntent ID en el pedido
  await prisma.order.update({
    where: { id: order.id },
    data: { stripePaymentIntentId: paymentIntent.id },
  })

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    orderId: order.id,
  })
}
```

- [ ] **Step 2: Webhook de Stripe — confirmar pedido al pagar**

Crear `src/app/api/webhooks/stripe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    const orderId = pi.metadata.orderId

    await prisma.order.update({
      where: { stripePaymentIntentId: pi.id },
      data: {
        status: 'PREPARING',
        paidAt: new Date(),
      },
    })

    console.log(`Pedido ${orderId} confirmado — pago ${pi.id}`)
  }

  return NextResponse.json({ received: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: checkout api - PaymentIntent creation + Stripe webhook"
```

---

## Task 11: Checkout — UI de 3 pasos

**Files:**
- Create: `src/app/checkout/page.tsx`
- Create: `src/components/checkout/StepPersonal.tsx`
- Create: `src/components/checkout/StepAddress.tsx`
- Create: `src/components/checkout/StepPayment.tsx`

- [ ] **Step 1: Checkout page — orquestador de los 3 pasos**

Crear `src/app/checkout/page.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/store/cart'
import { CheckoutFormData, DELIVERY_COSTS } from '@/types'
import { DeliveryType } from '@prisma/client'
import StepPersonal from '@/components/checkout/StepPersonal'
import StepAddress from '@/components/checkout/StepAddress'
import StepPayment from '@/components/checkout/StepPayment'

const STEPS = ['Tus datos', 'Dirección y envío', 'Pago']

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<Partial<CheckoutFormData>>({
    deliveryType: DeliveryType.LOCAL,
  })
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  const deliveryCost = DELIVERY_COSTS[(formData.deliveryType as DeliveryType) ?? 'LOCAL']
  const total = subtotal() + deliveryCost

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)

  const handleStep1 = (data: Pick<CheckoutFormData, 'customerName' | 'customerPhone' | 'customerEmail'>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setStep(1)
  }

  const handleStep2 = async (data: Omit<CheckoutFormData, 'customerName' | 'customerPhone' | 'customerEmail'>) => {
    const merged = { ...formData, ...data } as CheckoutFormData
    setFormData(merged)

    // Crear pedido + PaymentIntent
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...merged,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
    })
    const json = await res.json()
    if (!res.ok) {
      alert(json.error ?? 'Error al procesar el pedido')
      return
    }
    setClientSecret(json.clientSecret)
    setOrderId(json.orderId)
    setStep(2)
  }

  const handlePaymentSuccess = () => {
    clearCart()
    router.push(`/confirmacion/${orderId}`)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                i <= step ? 'bg-pink text-white' : 'bg-dark/10 text-dark/40'
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${i <= step ? 'text-dark' : 'text-dark/40'}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 ${i < step ? 'bg-pink' : 'bg-dark/10'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Formulario */}
        <div className="flex-1">
          {step === 0 && <StepPersonal onNext={handleStep1} defaultValues={formData} />}
          {step === 1 && <StepAddress onNext={handleStep2} defaultValues={formData} />}
          {step === 2 && clientSecret && (
            <StepPayment
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </div>

        {/* Resumen sidebar */}
        <div className="lg:w-72">
          <div className="bg-white rounded-3xl p-5 shadow-sm sticky top-24">
            <h3 className="font-bold text-dark mb-3 text-sm">Resumen del pedido</h3>
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-xs text-dark/60 py-1.5 border-b border-dark/5">
                <span>{item.name} ×{item.quantity}</span>
                <span>{formatPrice(item.priceRetail * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between text-xs text-dark/60 py-2">
              <span>Subtotal</span><span>{formatPrice(subtotal())}</span>
            </div>
            <div className="flex justify-between text-xs text-dark/60 pb-2 border-b border-dark/5">
              <span>Envío</span>
              <span>{deliveryCost === 0 ? 'Gratis' : formatPrice(deliveryCost)}</span>
            </div>
            <div className="flex justify-between font-black text-dark pt-3">
              <span>Total</span>
              <span className="text-pink">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: StepPersonal**

Crear `src/components/checkout/StepPersonal.tsx`:

```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  customerName: z.string().min(2, 'Ingresa tu nombre completo'),
  customerPhone: z.string().min(10, 'Ingresa un teléfono válido (10 dígitos)'),
  customerEmail: z.string().email('Ingresa un correo válido'),
})

type FormData = z.infer<typeof schema>

interface Props {
  onNext: (data: FormData) => void
  defaultValues: Partial<FormData>
}

const inputClass =
  'w-full px-4 py-3 border-2 border-dark/10 rounded-2xl text-dark text-sm focus:border-pink outline-none transition-colors'

export default function StepPersonal({ onNext, defaultValues }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: defaultValues.customerName ?? '',
      customerPhone: defaultValues.customerPhone ?? '',
      customerEmail: defaultValues.customerEmail ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <h2 className="text-2xl font-black text-dark">Tus datos</h2>

      <div>
        <label className="text-sm font-medium text-dark/70 block mb-1.5">Nombre completo</label>
        <input {...register('customerName')} className={inputClass} placeholder="Tu nombre" />
        {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-dark/70 block mb-1.5">Teléfono</label>
        <input {...register('customerPhone')} className={inputClass} placeholder="10 dígitos" type="tel" />
        {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-dark/70 block mb-1.5">Correo electrónico</label>
        <input {...register('customerEmail')} className={inputClass} placeholder="correo@ejemplo.com" type="email" />
        {errors.customerEmail && <p className="text-red-500 text-xs mt-1">{errors.customerEmail.message}</p>}
      </div>

      <button type="submit" className="btn-primary w-full">Continuar →</button>
    </form>
  )
}
```

- [ ] **Step 3: StepAddress**

Crear `src/components/checkout/StepAddress.tsx`:

```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DeliveryType } from '@prisma/client'
import DeliveryOption from '@/components/ui/DeliveryOption'

const schema = z.object({
  street: z.string().min(3, 'Ingresa tu calle y número'),
  colonia: z.string().min(2, 'Ingresa tu colonia'),
  postalCode: z.string().length(5, 'El código postal tiene 5 dígitos'),
  city: z.string().min(2, 'Ingresa la ciudad'),
  state: z.string().min(2, 'Ingresa el estado'),
  references: z.string().optional().default(''),
  deliveryType: z.nativeEnum(DeliveryType),
})

type FormData = z.infer<typeof schema>

interface Props {
  onNext: (data: FormData) => void
  defaultValues: Partial<FormData>
}

const inputClass =
  'w-full px-4 py-3 border-2 border-dark/10 rounded-2xl text-dark text-sm focus:border-pink outline-none transition-colors'

export default function StepAddress({ onNext, defaultValues }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      street: defaultValues.street ?? '',
      colonia: defaultValues.colonia ?? '',
      postalCode: defaultValues.postalCode ?? '',
      city: defaultValues.city ?? 'Juárez',
      state: defaultValues.state ?? 'Nuevo León',
      references: defaultValues.references ?? '',
      deliveryType: defaultValues.deliveryType ?? DeliveryType.LOCAL,
    },
  })

  const selectedDelivery = watch('deliveryType')

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <h2 className="text-2xl font-black text-dark">Dirección de entrega</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-sm font-medium text-dark/70 block mb-1.5">Calle y número</label>
          <input {...register('street')} className={inputClass} placeholder="Calle Principal #123" />
          {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-dark/70 block mb-1.5">Colonia</label>
          <input {...register('colonia')} className={inputClass} placeholder="Colonia" />
          {errors.colonia && <p className="text-red-500 text-xs mt-1">{errors.colonia.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-dark/70 block mb-1.5">Código postal</label>
          <input {...register('postalCode')} className={inputClass} placeholder="67000" maxLength={5} />
          {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-dark/70 block mb-1.5">Ciudad</label>
          <input {...register('city')} className={inputClass} />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-dark/70 block mb-1.5">Estado</label>
          <input {...register('state')} className={inputClass} />
          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium text-dark/70 block mb-1.5">
            Referencias <span className="text-dark/30">(opcional)</span>
          </label>
          <input {...register('references')} className={inputClass} placeholder="Entre calles, color de casa..." />
        </div>
      </div>

      {/* Opciones de envío */}
      <div>
        <h3 className="font-bold text-dark mb-3">Tipo de envío</h3>
        <div className="space-y-2">
          {Object.values(DeliveryType).map((type) => (
            <DeliveryOption
              key={type}
              type={type}
              selected={selectedDelivery === type}
              onSelect={(t) => setValue('deliveryType', t)}
            />
          ))}
        </div>
      </div>

      <button type="submit" className="btn-primary w-full">Continuar al pago →</button>
    </form>
  )
}
```

- [ ] **Step 4: StepPayment con Stripe Elements**

Crear `src/components/checkout/StepPayment.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/confirmacion/stripe`,
      },
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Error al procesar el pago')
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-2xl font-black text-dark">Pago seguro</h2>

      <div className="bg-white border-2 border-dark/10 rounded-2xl p-4">
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-dark/40">
        <span>🔒</span>
        <span>Tu información está protegida con cifrado SSL de 256 bits</span>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Procesando...
          </>
        ) : (
          '🔒 Pagar con Stripe'
        )}
      </button>
    </form>
  )
}

export default function StepPayment({
  clientSecret,
  onSuccess,
}: {
  clientSecret: string
  onSuccess: () => void
}) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, locale: 'es-419' }}>
      <PaymentForm onSuccess={onSuccess} />
    </Elements>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: checkout 3-step UI - personal, address, Stripe payment"
```

---

## Task 12: Confirmación y Seguimiento de pedido

**Files:**
- Create: `src/app/confirmacion/[id]/page.tsx`
- Create: `src/app/seguimiento/[id]/page.tsx`

- [ ] **Step 1: Página de confirmación**

Crear `src/app/confirmacion/[id]/page.tsx`:

```typescript
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import OrderStatusBadge from '@/components/ui/OrderStatusBadge'

export default async function ConfirmacionPage({ params }: { params: { id: string } }) {
  if (params.id === 'stripe') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">✅</p>
        <h1 className="text-2xl font-black text-dark mb-2">¡Pago recibido!</h1>
        <p className="text-dark/50 mb-6">Tu pedido está siendo procesado.</p>
        <Link href="/" className="btn-primary inline-block">Volver a la tienda</Link>
      </div>
    )
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          product: { select: { name: true } },
        },
      },
    },
  })

  if (!order) notFound()

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)

  return (
    <div className="max-w-lg mx-auto px-4 py-20">
      <div className="text-center mb-8">
        <p className="text-6xl mb-4">🎉</p>
        <h1 className="text-3xl font-black text-dark mb-2">¡Pedido confirmado!</h1>
        <p className="text-dark/50">Gracias, {order.customerName}. En breve recibirás un correo de confirmación.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-dark/40 font-mono">#{order.id.slice(-8).toUpperCase()}</p>
          <OrderStatusBadge status={order.status} />
        </div>

        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-2 border-b border-dark/5">
            <span className="text-dark/70">{item.product.name} ×{item.quantity}</span>
            <span className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
          </div>
        ))}

        <div className="flex justify-between font-black text-dark pt-4">
          <span>Total pagado</span>
          <span className="text-pink">{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link href={`/seguimiento/${order.id}`} className="btn-primary text-center">
          Rastrear mi pedido
        </Link>
        <Link href="/" className="btn-ghost text-center">
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Página de seguimiento**

Crear `src/app/seguimiento/[id]/page.tsx`:

```typescript
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import OrderStatusBadge from '@/components/ui/OrderStatusBadge'
import { OrderStatus } from '@prisma/client'

const STATUS_STEPS: OrderStatus[] = ['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED']

const STATUS_STEP_LABELS: Record<string, string> = {
  PENDING:   'Pedido recibido',
  PREPARING: 'Preparando pedido',
  SHIPPED:   'En camino',
  DELIVERED: 'Entregado',
}

export default async function SeguimientoPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: { select: { name: true } } } } },
  })

  if (!order) notFound()

  const currentStep = STATUS_STEPS.indexOf(order.status)
  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-dark mb-2">Estado de tu pedido</h1>
      <p className="text-dark/50 text-sm mb-6 font-mono">#{order.id.slice(-8).toUpperCase()}</p>

      <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <p className="font-medium text-dark">{order.customerName}</p>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {STATUS_STEPS.map((status, i) => {
            const done = i <= currentStep
            return (
              <div key={status} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                    done ? 'bg-pink text-white' : 'bg-dark/10 text-dark/30'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </div>
                <span className={`text-sm font-medium ${done ? 'text-dark' : 'text-dark/30'}`}>
                  {STATUS_STEP_LABELS[status]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <h3 className="font-bold text-dark mb-3 text-sm">Productos</h3>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-2 border-b border-dark/5">
            <span className="text-dark/70">{item.product.name} ×{item.quantity}</span>
            <span>{formatPrice(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between font-black text-dark pt-3">
          <span>Total</span>
          <span className="text-pink">{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: order confirmation and tracking pages"
```

---

## Task 13: PWA Config

**Files:**
- Create: `public/manifest.json`
- Modify: `next.config.ts`

- [ ] **Step 1: Crear manifest.json**

Crear `public/manifest.json`:

```json
{
  "name": "Novedades La Güera",
  "short_name": "La Güera",
  "description": "Belleza, accesorios, hogar y más. Envío a Juárez y toda la república.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFF5FA",
  "theme_color": "#E91E8C",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "categories": ["shopping", "lifestyle"],
  "lang": "es-MX"
}
```

- [ ] **Step 2: Crear íconos placeholder**

Crear `public/icons/` y agregar dos imágenes de 192×192 y 512×512 píxeles con el logo. Por ahora, usar íconos placeholder. Estas imágenes deben ser reemplazadas con el logo real antes de producción.

```bash
# Crear carpeta de iconos
mkdir -p public/icons
# Nota: colocar icon-192.png e icon-512.png manualmente en public/icons/
```

- [ ] **Step 3: Agregar meta tags de PWA al layout**

En `src/app/layout.tsx`, actualizar el export de metadata:

```typescript
export const metadata: Metadata = {
  title: 'Novedades La Güera — Belleza, Accesorios y Más',
  description: '¡Todo lo que necesitas, al mejor precio! Tienda online con envío a Juárez y toda la república.',
  manifest: '/manifest.json',
  themeColor: '#E91E8C',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'La Güera',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: PWA manifest and meta tags"
```

---

## Task 14: Admin — Panel de administración (Plan 2)

> **Nota:** El panel de administración (NextAuth login, Dashboard, gestión de pedidos y productos) está documentado en el **Plan 2**: `docs/superpowers/plans/2026-05-28-novedades-la-guera-admin-plan.md`. Este plan 1 produce una tienda cliente completamente funcional. Continuar con Plan 2 para implementar el admin.

---

## Checklist de verificación final (Plan 1)

Antes de considerar el Plan 1 completo, verificar en el browser:

- [ ] Home carga con Hero, TrustStrip, FeaturedProducts, MayoreoBanner, StripeSeal, Testimonials y Footer
- [ ] Catálogo `/productos` filtra por categoría correctamente
- [ ] Detalle de producto `/productos/[slug]` carga y el botón "Agregar" actualiza el carrito
- [ ] Contador del carrito en el Navbar se actualiza al agregar productos
- [ ] Página `/carrito` muestra items y permite modificar cantidades
- [ ] Checkout 3 pasos: los 3 formularios validan y avanzan correctamente
- [ ] Stripe Elements carga en el paso 3
- [ ] Webhook de Stripe confirma el pedido en la base de datos
- [ ] Páginas de confirmación y seguimiento muestran datos del pedido
- [ ] La app es instalable como PWA (botón de instalación en Chrome)
- [ ] El diseño es responsive: mobile y desktop se ven correctamente

```bash
git tag v0.1.0-store
git push origin main --tags
```
