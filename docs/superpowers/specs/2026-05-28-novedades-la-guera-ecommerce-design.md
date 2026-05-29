# Diseño: E-commerce PWA — Novedades La Güera

**Fecha:** 2026-05-28  
**Estado:** Aprobado ✅  
**Stack:** Next.js · Tailwind CSS · Stripe · PostgreSQL · Prisma

---

## 1. Contexto del negocio

- **Negocio:** Novedades La Güera — tienda familiar local en Juárez, Nuevo León
- **Dirección física:** Arturo B. de la Garza #108, Juárez, N.L.
- **Giro:** Novedades, belleza, accesorios, hogar, dulcería
- **Modalidad:** Mayoreo y menudeo
- **Entregas:** Local (ciudad de Juárez) y paquetería nacional
- **Redes:** @novedadeslagueraa (Instagram, TikTok) · Novedades La Güera Mayoreo (Facebook)

---

## 2. Identidad de marca

| Elemento | Valor |
|---|---|
| Color primario | `#E91E8C` (rosa magenta) |
| Color secundario | `#FF6BB3` (rosa claro) |
| Acento | `#FFCA28` (amarillo) |
| Oscuro | `#1a1a2e` |
| Fondo crema | `#FFF5FA` |
| Tipografía | System UI / Segoe UI — peso 900 para headlines |
| Estilo visual | Vibrante & Juguetón (Propuesta A aprobada) |
| Decoración | Blobs radiales en rosa/amarillo, bordes redondeados, sombras rosadas |

---

## 3. Arquitectura general

```
/                        → Tienda cliente (PWA)
  /productos             → Catálogo con filtros
  /productos/[slug]      → Detalle de producto
  /carrito               → Carrito de compra
  /checkout              → Formulario + Stripe
  /confirmacion/[id]     → Confirmación de pedido
  /seguimiento/[id]      → Estado del pedido

/admin                   → Panel administración (ruta protegida)
  /admin/dashboard       → Métricas + pedidos del día
  /admin/pedidos         → Lista de todos los pedidos
  /admin/pedidos/[id]    → Detalle y gestión de pedido
  /admin/productos       → Gestión de catálogo
  /admin/productos/nuevo → Agregar producto
```

---

## 4. Diseño aprobado — Sección por sección

### 4.1 Navbar + Hero (Sección 1)

**Mobile:**
- Topbar blanco con logo badge rosa (gradiente) + nombre del negocio + subtítulo ciudad
- Íconos: búsqueda, carrito (con contador amarillo), menú hamburguesa en rosa
- Hero con blobs decorativos (rosa + amarillo), mascota a la derecha
- Tag pill "Colección Primavera" en rosa claro
- Headline 26px bold oscuro con acento rosa
- Botones: CTA primario (gradiente rosa) + ghost secundario
- Strip de stats: 500+ Productos · 1K+ Clientes · 4.9★
- Barra de 5 categorías en colores (`#1a1a2e`, rosa, rosa claro, amarillo, `#F06292`)

**Desktop:**
- Nav 60px: logo izquierda, links centro (Inicio, Belleza, Accesorios, Hogar, Dulcería, Mayoreo, badge OFERTAS), buscador + botón carrito derecha
- Hero split: texto izquierda (tag, headline 48px, subtexto, 2 botones, stats), mascota derecha con 3 badges flotantes (envío express, mayoreo/menudeo, pagos Stripe)
- Blobs decorativos grandes detrás de la mascota
- Misma barra de categorías

### 4.2 Productos Destacados (Sección 2)

- Header: eyebrow en rosa, título con acento, subtítulo gris
- Chips de filtro: Todo / Belleza / Accesorios / Hogar / Dulcería / Novedades
- Cards de producto con:
  - Fondo por categoría (rosa/amarillo/verde/rosa claro)
  - Badge posicional: `NUEVO` (rosa), `-X% OFERTA` (amarillo), `MAYOREO` (oscuro)
  - Botón wishlist (corazón) en esquina superior derecha
  - Tag de precio mayoreo en rosa claro
  - Precio menudeo principal en `#E91E8C` tamaño grande
  - Botón "Agregar al carrito" gradiente rosa full-width
- Mobile: grid 2 columnas
- Desktop: grid 4 columnas + link "Ver catálogo completo →"

### 4.3 Confianza + Mayoreo (Sección 3)

**Strip de beneficios (4 items):**
- 🚀 Envío Rápido — Juárez mismo día, república 3-5 días
- ⭐ Calidad Garantizada
- 🔒 Pago Seguro — Stripe
- 💰 Precios Bajos — mayoreo y menudeo

**Banner Mayoreo:**
- Fondo oscuro (`#1a1a2e` → `#2d1b4e`) con blobs decorativos
- Tag amarillo "⭐ Programa Mayoreo"
- Título bold blanco con acento amarillo
- 4 checks con icono dorado ✦
- Botón CTA "Ver precios mayoreo →"
- Desktop: lado derecho con stats (1K+ clientes, 500+ productos, 4.9★, 3 años) + 3 pasos de cómo ordenar

**Sello Stripe:**
- Badge con ícono candado, texto, logos Stripe/Visa/Mastercard/Amex
- Mobile: compacto horizontal
- Desktop: strip completo con "Compra protegida 🛡️"

### 4.4 Testimonios (Sección 4)

- Calificación general: número 4.9 en rosa, 5 estrellas, barras de distribución
- Cards de reseña: avatar con color, nombre, estrellas amarillas, sello "✓ Compra verificada" verde, texto, chip del producto comprado
- Soporte para fotos adjuntas en la reseña
- Mobile: apiladas · Desktop: grid 3 columnas
- Strip de Instagram: gradiente rosa, handle @novedadeslagueraa, miniaturas de feed

### 4.5 Footer (Sección 5)

- Fondo oscuro `#1a1a2e` / `#2d1b4e`
- Mobile: logo + descripción, newsletter, redes sociales, grid 2 columnas de links, dirección, horarios
- Desktop: 4 columnas — (1) Marca + newsletter, (2) Links tienda, (3) Links ayuda, (4) Contacto + horarios
- Horarios: Lun–Vie 9am–7pm · Sáb 9am–4pm · Pedidos online 24/7
- Barra inferior: copyright + links legales + badge Stripe

### 4.6 Carrito + Checkout (Sección 6)

**Carrito:**
- Items con imagen (fondo color por categoría), categoría, nombre, precio mayoreo referencial, controles cantidad (+/−), precio total, botón eliminar
- Resumen: subtotal, campo de cupón (desktop), envío "calcular", total
- Botón "Proceder al pago" gradiente rosa

**Checkout — 3 pasos:**
1. **Datos personales:** nombre, teléfono, correo
2. **Dirección + Envío:**
   - Calle, colonia, CP, ciudad, estado, referencias
   - Selector de envío: Entrega local Juárez $50 · Paquetería $120 · Recoger en tienda Gratis
3. **Pago Stripe:**
   - Campo número de tarjeta, fecha expiración, CVC
   - Nota de seguridad SSL
   - Botón "Pagar $XXX con Stripe 🔒"

Desktop: formulario izquierda + sidebar de resumen de pedido derecha (items + totales + botón pago)

### 4.7 Panel de Administración (Sección 7)

**Paleta admin:** Fondo `#0f172a`, cards `#1e293b`, border `#334155`, textos `#94a3b8`

**Mobile — estructura:**
- Topbar con logo + campana de notificaciones con contador
- Stats scrollable horizontal (pedidos hoy, ventas, pendientes, en camino)
- Lista de órdenes con badges de estado: 🔵 Nuevo · 🟡 En proceso · 🚀 Enviado · ✅ Entregado · 🏍️ Local · 📦 Paquetería
- Botones de acción rápida por pedido (Preparar / Marcar enviado / Marcar entregado)
- Bottom nav: Dashboard · Pedidos · Productos · Config

**Desktop — estructura:**
- Sidebar izquierdo 200px: logo, navegación con badges, link "Ver tienda →"
- Contenido principal: topbar con saludo + fecha, grid 4 stats con deltas (↑/↓), tabla de pedidos (pedido, cliente, productos, envío, total, estado, acciones)
- Panel lateral derecho de detalle (se abre al seleccionar pedido): datos cliente, dirección, lista de productos, selector de estado dropdown, botones: Marcar preparado · Notificar a cliente · Imprimir etiqueta

---

## 5. Flujos de usuario

### Cliente comprando
```
Home → Catálogo (filtrar categoría) → Producto individual
→ Agregar al carrito → Carrito (ajustar cantidades)
→ Checkout (datos + dirección + envío + pago Stripe)
→ Confirmación (número de pedido) → Seguimiento
```

### La Güera gestionando pedidos
```
Admin login → Dashboard (ver pedidos del día)
→ Click en pedido nuevo → Ver detalle completo
→ Cambiar estado (preparando → enviado → entregado)
→ Notificar a cliente
```

---

## 6. Componentes reutilizables

| Componente | Uso |
|---|---|
| `ProductCard` | Grid de productos, búsqueda, relacionados |
| `CategoryChip` | Filtros en catálogo y home |
| `OrderStatusBadge` | Lista y detalle de pedidos admin |
| `DeliveryOption` | Selector en checkout |
| `BenefitItem` | Strip de beneficios |
| `ReviewCard` | Sección testimonios |
| `StripeCardInput` | Checkout pago |
| `FloatingBadge` | Hero decorativo |

---

## 7. Integraciones

| Servicio | Propósito |
|---|---|
| **Stripe** | Procesamiento de pagos (tarjeta, Visa, MC, Amex) |
| **PostgreSQL + Prisma** | Base de datos de productos, pedidos, clientes |
| **Cloudinary** | Almacenamiento de imágenes de productos |
| **Next.js API Routes** | Backend endpoints (pedidos, productos, pagos) |
| **NextAuth** | Autenticación del panel admin |

---

## 8. Responsive

| Breakpoint | Comportamiento |
|---|---|
| `< 768px` | Mobile: single column, bottom nav en admin |
| `768px–1024px` | Tablet: grids de 2 col, nav visible |
| `> 1024px` | Desktop: layouts completos como diseñados |

---

## 9. Lo que NO está en scope (MVP)

- Sistema de reseñas para que clientes escriban (solo mostrar)
- App nativa iOS/Android
- Integración con paquetería automática (cotización manual)
- Sistema de cupones (UI diseñada pero lógica no en MVP)
- Chat en vivo

---

## 10. Decisiones de diseño tomadas

- **Stripe sobre MercadoPago:** requerimiento explícito del usuario
- **PWA sobre app nativa:** sin costo de App Store, instalable desde el navegador
- **Mobile-first + Desktop simultáneo:** aprobado en brainstorming
- **Estilo Vibrante & Juguetón (Propuesta A):** elegido sobre Suave/Elegante y Dark/Bold
- **Fondo crema `#FFF5FA`:** más identidad de marca que blanco puro
- **Admin panel en dark mode:** mejor contraste para uso operativo
