import { LayoutDashboard, ShoppingBag, Package } from 'lucide-react'
import { ElementType } from 'react'

export interface NavItem {
  href: string
  label: string
  icon: ElementType
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/productos', label: 'Productos', icon: Package },
]
