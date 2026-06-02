import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSetting } from '@/lib/settings'
import ImageUploader from '@/components/admin/ImageUploader'
import StripeConfigForm from '@/components/admin/StripeConfigForm'
import ShippingConfig from '@/components/admin/ShippingConfig'
import AdminsManager from '@/components/admin/AdminsManager'

const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? ''

export default async function ConfiguracionPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const [logoUrl, mascotUrl] = await Promise.all([
    getSetting('logo_url'),
    getSetting('hero_mascot_url'),
  ])

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-white font-black text-2xl">Configuración</h1>
        <p className="text-admin-muted text-sm mt-1">Personaliza las imágenes de tu tienda</p>
      </div>

      {!UPLOAD_PRESET && (
        <div className="mb-6 p-4 bg-yellow/10 border border-yellow/30 rounded-2xl">
          <p className="text-yellow text-sm font-medium mb-1">⚠️ Cloudinary no configurado</p>
          <p className="text-yellow/80 text-xs leading-relaxed">
            Agrega <code className="font-mono bg-yellow/10 px-1 rounded">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> y{' '}
            <code className="font-mono bg-yellow/10 px-1 rounded">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> en tu{' '}
            <code className="font-mono bg-yellow/10 px-1 rounded">.env.local</code> para activar las subidas.
          </p>
        </div>
      )}

      <div className="bg-admin-card rounded-3xl p-6 border border-admin-border space-y-8">
        <ImageUploader
          label="Logo de la tienda"
          description="Aparece en el navbar, footer y panel admin. Recomendado: PNG transparente, cuadrado."
          settingKey="logo_url"
          currentUrl={logoUrl}
          uploadPreset={UPLOAD_PRESET}
        />

        <div className="border-t border-admin-border pt-8">
          <ImageUploader
            label="Mascota (sección principal)"
            description="Imagen grande en el inicio de la tienda. Recomendado: PNG sin fondo."
            settingKey="hero_mascot_url"
            currentUrl={mascotUrl}
            uploadPreset={UPLOAD_PRESET}
          />
        </div>
      </div>

      <div className="bg-admin-card rounded-3xl p-6 border border-admin-border mt-6">
        <div className="mb-5">
          <p className="text-white font-semibold text-sm">Configuración de Stripe</p>
          <p className="text-admin-muted text-xs mt-0.5">
            Claves de pago cifradas con AES-256-GCM antes de guardarse en la base de datos
          </p>
        </div>
        <StripeConfigForm />
      </div>

      <div className="bg-admin-card rounded-3xl p-6 border border-admin-border mt-6">
        <div className="mb-5">
          <p className="text-white font-semibold text-sm">Costos de envío</p>
          <p className="text-admin-muted text-xs mt-0.5">
            Configura rangos de distancia y precios. Google Maps calcula la distancia automáticamente.
          </p>
        </div>
        <ShippingConfig />
      </div>

      <div className="bg-admin-card rounded-3xl p-6 border border-admin-border mt-6">
        <div className="mb-5">
          <p className="text-white font-semibold text-sm">Administradores</p>
          <p className="text-admin-muted text-xs mt-0.5">
            Gestiona las cuentas con acceso al panel de administración.
          </p>
        </div>
        <AdminsManager currentUserId={session.user?.id ?? ''} />
      </div>
    </div>
  )
}
