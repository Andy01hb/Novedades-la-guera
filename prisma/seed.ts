import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { PrismaClient, Category, ProductBadge } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Admin user
  const bcrypt = await import('bcryptjs')
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
    // BELLEZA
    {
      name: 'Set de Sombras Glam',
      slug: 'set-sombras-glam',
      description: 'Paleta de 12 sombras con acabados mate y brillantes. Ideal para looks del día y de noche.',
      category: Category.BELLEZA,
      badge: ProductBadge.NUEVO,
      imageUrl: 'https://picsum.photos/seed/sombras/600/600',
      priceRetail: 18000,
      priceWholesale: 14000,
      wholesaleMin: 6,
      stock: 50,
    },
    {
      name: 'Labial Matte Rosa',
      slug: 'labial-matte-rosa',
      description: 'Labial de larga duración con fórmula ultra mate. Color rosa nude perfecto para uso diario.',
      category: Category.BELLEZA,
      badge: ProductBadge.OFERTA,
      imageUrl: 'https://picsum.photos/seed/labial/600/600',
      priceRetail: 9500,
      priceWholesale: 7000,
      wholesaleMin: 10,
      stock: 120,
    },
    {
      name: 'Base Líquida Natural',
      slug: 'base-liquida-natural',
      description: 'Base de cobertura media-alta con acabado natural. Disponible en 10 tonos.',
      category: Category.BELLEZA,
      imageUrl: 'https://picsum.photos/seed/base/600/600',
      priceRetail: 22000,
      priceWholesale: 17000,
      wholesaleMin: 6,
      stock: 40,
    },
    {
      name: 'Kit Brochas Profesional',
      slug: 'kit-brochas-profesional',
      description: 'Set de 10 brochas de maquillaje con cerdas sintéticas de alta calidad.',
      category: Category.BELLEZA,
      badge: ProductBadge.NUEVO,
      imageUrl: 'https://picsum.photos/seed/brochas/600/600',
      priceRetail: 28000,
      priceWholesale: 22000,
      wholesaleMin: 4,
      stock: 25,
    },
    // ACCESORIOS
    {
      name: 'Aretes Flor Dorada',
      slug: 'aretes-flor-dorada',
      description: 'Aretes de moda con diseño floral dorado. Material antialérgico.',
      category: Category.ACCESORIOS,
      badge: ProductBadge.OFERTA,
      imageUrl: 'https://picsum.photos/seed/aretes/600/600',
      priceRetail: 8500,
      priceWholesale: 6000,
      wholesaleMin: 12,
      stock: 100,
    },
    {
      name: 'Collar Perlas Minimalista',
      slug: 'collar-perlas-minimalista',
      description: 'Collar delicado con perlas de imitación y cadena dorada de 45 cm.',
      category: Category.ACCESORIOS,
      imageUrl: 'https://picsum.photos/seed/collar/600/600',
      priceRetail: 12000,
      priceWholesale: 9000,
      wholesaleMin: 8,
      stock: 60,
    },
    {
      name: 'Pulsera Ajustable Charm',
      slug: 'pulsera-ajustable-charm',
      description: 'Pulsera ajustable con dije de estrella. Disponible en plateado y dorado.',
      category: Category.ACCESORIOS,
      badge: ProductBadge.NUEVO,
      imageUrl: 'https://picsum.photos/seed/pulsera/600/600',
      priceRetail: 7000,
      priceWholesale: 5000,
      wholesaleMin: 12,
      stock: 80,
    },
    {
      name: 'Diadema Lazo Satinado',
      slug: 'diadema-lazo-satinado',
      description: 'Diadema con lazo de tela satinada. Perfecta para looks casuales y elegantes.',
      category: Category.ACCESORIOS,
      imageUrl: 'https://picsum.photos/seed/diadema/600/600',
      priceRetail: 5500,
      priceWholesale: 4000,
      wholesaleMin: 10,
      stock: 90,
    },
    // HOGAR
    {
      name: 'Portavelas Decorativo',
      slug: 'portavelas-decorativo',
      description: 'Portavelas de cerámica con diseño floral. Incluye vela de 4 horas.',
      category: Category.HOGAR,
      imageUrl: 'https://picsum.photos/seed/velas/600/600',
      priceRetail: 22000,
      stock: 30,
    },
    {
      name: 'Dispensador Jabón Mármol',
      slug: 'dispensador-jabon-marmol',
      description: 'Dispensador de jabón con acabado mármol negro. Capacidad 300 ml.',
      category: Category.HOGAR,
      badge: ProductBadge.NUEVO,
      imageUrl: 'https://picsum.photos/seed/jabon/600/600',
      priceRetail: 18000,
      priceWholesale: 14000,
      wholesaleMin: 4,
      stock: 35,
    },
    {
      name: 'Cojín Bordado Flores',
      slug: 'cojin-bordado-flores',
      description: 'Cojín decorativo 40×40 cm con bordado floral artesanal.',
      category: Category.HOGAR,
      imageUrl: 'https://picsum.photos/seed/cojin/600/600',
      priceRetail: 32000,
      stock: 20,
    },
    // DULCERIA
    {
      name: 'Dulces Surtidos Bolsa',
      slug: 'dulces-surtidos-bolsa',
      description: 'Bolsa surtida con 50 piezas de dulces mexicanos. Ideal para fiestas y eventos.',
      category: Category.DULCERIA,
      badge: ProductBadge.MAYOREO,
      imageUrl: 'https://picsum.photos/seed/dulces/600/600',
      priceRetail: 5000,
      priceWholesale: 3500,
      wholesaleMin: 10,
      stock: 200,
    },
    {
      name: 'Gomitas Frutas Tropicales',
      slug: 'gomitas-frutas-tropicales',
      description: 'Gomitas con sabores tropicales. Bolsa de 250 g.',
      category: Category.DULCERIA,
      imageUrl: 'https://picsum.photos/seed/gomitas/600/600',
      priceRetail: 3500,
      priceWholesale: 2500,
      wholesaleMin: 12,
      stock: 150,
    },
    // NOVEDADES
    {
      name: 'Libreta Kawaii Pastel',
      slug: 'libreta-kawaii-pastel',
      description: 'Libreta A5 con diseño kawaii, 200 hojas rayadas y separadores de colores.',
      category: Category.NOVEDADES,
      badge: ProductBadge.NUEVO,
      imageUrl: 'https://picsum.photos/seed/libreta/600/600',
      priceRetail: 11000,
      priceWholesale: 8500,
      wholesaleMin: 6,
      stock: 70,
    },
    {
      name: 'Popote Reutilizable Set',
      slug: 'popote-reutilizable-set',
      description: 'Set de 4 popotes de acero inoxidable con funda de tela y cepillo de limpieza.',
      category: Category.NOVEDADES,
      imageUrl: 'https://picsum.photos/seed/popotes/600/600',
      priceRetail: 8000,
      priceWholesale: 6000,
      wholesaleMin: 8,
      stock: 55,
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
