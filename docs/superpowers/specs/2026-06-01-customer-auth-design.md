# Customer Authentication & Order History — Design Spec
Date: 2026-06-01

## Overview
Add a customer-facing authentication system (separate from admin auth) supporting email/password, Google, Facebook, and Apple Sign In. Customers must be logged in to place orders and can view their order history. The store remains fully browsable without login.

## Database

### New model: `Customer`
```prisma
model Customer {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  password      String?  // null for OAuth-only accounts
  image         String?  // avatar from OAuth provider
  provider      String?  // 'google' | 'facebook' | 'apple' | 'credentials'
  providerId    String?  // OAuth account ID
  createdAt     DateTime @default(now())
  orders        Order[]
}
```

### Order model changes
- Add `customerId String?` — optional FK to Customer (existing orders remain orphaned)
- Add relation: `customer Customer? @relation(fields: [customerId], references: [id])`

## Auth Architecture

Two separate NextAuth instances:
- **Admin auth** — existing, at `/api/auth/[...nextauth]`, credentials only, `AdminUser` model
- **Customer auth** — new, at `/api/customer-auth/[...nextauth]`, credentials + Google + Facebook + Apple, `Customer` model

Customer session is stored as JWT. Token includes `customerId`, `name`, `email`, `image`.

## OAuth Providers

### Google
- Provider: `GoogleProvider` from `next-auth/providers/google`
- Env: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### Facebook
- Provider: `FacebookProvider` from `next-auth/providers/facebook`
- Env: `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`

### Apple
- Provider: `AppleProvider` from `next-auth/providers/apple`
- Env: `APPLE_ID`, `APPLE_TEAM_ID`, `APPLE_PRIVATE_KEY`, `APPLE_KEY_ID`
- Note: Apple requires HTTPS and a verified domain

### Credentials
- Email + bcrypt-hashed password stored in `Customer.password`
- Same bcrypt flow as admin auth

## Pages

### `/cuenta/login`
- Three OAuth buttons: "Continuar con Google", "Continuar con Facebook", "Continuar con Apple"
- Divider "o"
- Email/password form
- Link to `/cuenta/registro`
- After login: redirect to `/cuenta/pedidos` or back to previous page

### `/cuenta/registro`
- Name, email, password, confirm password
- Terms acceptance checkbox
- After register: auto-login and redirect to `/cuenta/pedidos`

### `/cuenta/pedidos`
- Protected (redirect to `/cuenta/login` if not authenticated)
- List of customer's orders sorted by date desc
- Each row: order number, products, total, status badge, date, "Ver detalle →" link
- Empty state: "Aún no tienes pedidos. ¡Empieza a comprar!"

### `/cuenta/perfil`
- Protected
- Edit name, change password (only if credentials account)
- Shows which provider is linked (Google/Facebook/Apple badge)
- "Cerrar sesión" button

## Checkout changes

### Gate
- If customer is not logged in when clicking "Proceder al pago" → redirect to `/cuenta/login?returnTo=/checkout`
- After login → return to checkout with cart preserved (cart is in localStorage/context)

### Order association
- `POST /api/checkout` reads customer session cookie
- If authenticated: set `customerId` on created order
- If not authenticated: reject with 401 (enforced server-side, not just UI)

## Middleware update
- Add `/cuenta/pedidos` and `/cuenta/perfil` to protected routes
- Customer middleware separate from admin middleware

## Navbar changes
- Show user avatar/name when logged in (top right, next to cart)
- Dropdown: "Mis pedidos", "Mi perfil", "Cerrar sesión"
- When logged out: "Iniciar sesión" link

## Environment variables required
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
APPLE_ID=
APPLE_TEAM_ID=
APPLE_PRIVATE_KEY=
APPLE_KEY_ID=
CUSTOMER_NEXTAUTH_SECRET=  # separate from admin NEXTAUTH_SECRET
```

## Error handling
- OAuth account already exists with different provider → merge accounts by email
- Password reset flow → out of scope for v1 (add "Olvidé mi contraseña" in v2)
- Email already registered → show "Ya tienes una cuenta con ese correo. Inicia sesión."

## Out of scope (v1)
- Password reset / forgot password flow
- Email verification on registration
- Account deletion
- Address book (saved addresses)
