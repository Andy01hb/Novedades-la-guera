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
