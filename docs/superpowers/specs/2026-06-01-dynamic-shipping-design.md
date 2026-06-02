# Dynamic Shipping by Distance — Design Spec
Date: 2026-06-01

## Overview
Replace the current hardcoded delivery types (local/nacional/recoger) with a flexible distance-based shipping system powered by Google Maps Distance Matrix API. The admin configures shipping tiers; the customer sees the calculated cost after entering their address.

## Database

### New table: `ShippingTier`
```prisma
model ShippingTier {
  id         String   @id @default(cuid())
  minKm      Float
  maxKm      Float?   // null = unlimited (last tier)
  fixedPrice Int?     // in centavos; if set, ignore pricePerKm
  basePrice  Int?     // in centavos; base charge for per-km tier
  pricePerKm Int?     // in centavos per km; if set, use base + km * pricePerKm
  order      Int      // display/evaluation order
  label      String   // e.g. "Local", "Regional", "Nacional"
  createdAt  DateTime @default(now())
}
```

### SiteSettings additions
- `store_address` — plain text address used as origin for distance calculation
- `store_lat` / `store_lng` — geocoded coordinates (cached to avoid repeated geocoding)

### Order model changes
- Add `deliveryKm Float?` — distance in km calculated at checkout time
- Remove `deliveryType` enum dependency (keep for backwards compat, deprecate)

## API

### `GET /api/shipping/estimate?address=<url-encoded-address>`
Public endpoint. Calls Google Maps Distance Matrix API.
- Returns `{ km, tierId, label, cost, breakdown }` where breakdown shows how cost was calculated.
- Returns 400 if address cannot be geocoded.
- Returns 503 if Google Maps API key not configured.

### `GET /api/admin/shipping` — list tiers (auth required)
### `POST /api/admin/shipping` — create tier (auth required)
### `PATCH /api/admin/shipping/[id]` — update tier (auth required)
### `DELETE /api/admin/shipping/[id]` — delete tier (auth required)
### `PATCH /api/admin/shipping/store-location` — save store address + geocode it (auth required)

## Admin UI

### `/admin/configuracion` — new "Envíos" section
1. **Store location field** — address input with "Guardar ubicación" button. Shows map pin emoji + current address if set.
2. **Tiers table** — editable list of shipping tiers:
   - Columns: Rango (km), Nombre, Costo, Acciones
   - Inline edit on click
   - Drag to reorder
   - "Agregar rango" button adds a new row
3. **Preview calculator** — address input that shows what a customer would pay (uses `/api/shipping/estimate`)

### Tier form fields
- `label` — name shown to customer (e.g. "Envío local", "Envío nacional")
- `minKm`, `maxKm` — range
- Pricing toggle: "Precio fijo" or "Precio por kilómetro"
  - Fixed: single `fixedPrice` input
  - Per-km: `basePrice` + `pricePerKm` inputs, shows formula preview

## Checkout UI changes

### Address step
- Replace dropdown (local/nacional/recoger) with:
  - Full address form (same fields as before)
  - "Pickup at store" checkbox (bypasses distance calc, $0 cost)
- After address is filled: auto-call `/api/shipping/estimate`
- Show loading spinner while calculating
- Show result: "Envío estimado: $80 (45 km)" or error if unresolvable

### Cost display
- Show breakdown in order summary: subtotal + "Envío (45 km): $80" = total
- If pickup: "Recoger en tienda: $0"

## Checkout API changes
- `POST /api/checkout` — remove `deliveryType` field, add `address` string + `tierId`
- Server re-validates distance server-side (never trust client-sent cost)
- Recalculate cost from `ShippingTier` using the submitted address to prevent tampering

## Environment variables required
- `GOOGLE_MAPS_API_KEY` — must have Distance Matrix API and Geocoding API enabled

## Error handling
- Address not found by Google → show "No pudimos calcular el envío para esta dirección. Verifica que sea correcta."
- Google API key not configured → show "El cálculo de envío no está disponible. Contacta al vendedor."
- Distance exceeds all tiers → show "Lo sentimos, no entregamos en esa zona."

## Out of scope
- Real-time traffic-based delivery time estimates
- Multiple store locations
- International shipping
