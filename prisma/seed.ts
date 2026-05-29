import { PrismaClient, Category, ProductBadge } from '@prisma/client'

const prisma = new PrismaClient()

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
