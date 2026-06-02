'use client'
import { useEffect, useState } from 'react'
import { UserPlus, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface Admin {
  id: string
  name: string
  email: string
  createdAt: string
}

type Status = { type: 'success' | 'error'; message: string } | null

const inputClass =
  'w-full px-3 py-2 bg-admin-bg border border-admin-border rounded-xl text-white text-sm focus:border-pink outline-none transition-colors'
const labelClass = 'text-admin-muted text-xs font-medium block mb-1'

export default function AdminsManager({ currentUserId }: { currentUserId: string }) {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<Status>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/admins')
      if (res.ok) setAdmins(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function notify(type: 'success' | 'error', message: string) {
    setStatus({ type, message })
    setTimeout(() => setStatus(null), 4000)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        notify('error', data.error ?? 'Error al crear administrador')
        return
      }
      notify('success', `Administrador "${data.name}" creado`)
      setForm({ name: '', email: '', password: '' })
      setShowForm(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(admin: Admin) {
    if (!confirm(`¿Eliminar a ${admin.name} (${admin.email})?`)) return
    setDeleting(admin.id)
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        notify('error', data.error ?? 'Error al eliminar')
        return
      }
      notify('success', `${admin.name} eliminado`)
      load()
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      {status && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
            status.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {status.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {status.message}
        </div>
      )}

      {/* Lista */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-admin-muted text-sm py-2">Cargando...</p>
        ) : (
          admins.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between px-4 py-3 bg-admin-bg rounded-xl border border-admin-border"
            >
              <div>
                <p className="text-white text-sm font-medium">
                  {a.name}
                  {a.id === currentUserId && (
                    <span className="ml-2 text-xs text-pink font-normal">(tú)</span>
                  )}
                </p>
                <p className="text-admin-muted text-xs">{a.email}</p>
              </div>
              <button
                onClick={() => handleDelete(a)}
                disabled={deleting === a.id || a.id === currentUserId}
                className="p-1.5 rounded-lg text-admin-muted hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title={a.id === currentUserId ? 'No puedes eliminarte a ti mismo' : 'Eliminar'}
              >
                {deleting === a.id ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Trash2 size={15} />
                )}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Botón agregar */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink/10 border border-pink/30 text-pink text-sm font-medium hover:bg-pink/20 transition-colors"
        >
          <UserPlus size={15} />
          Agregar administrador
        </button>
      ) : (
        <form onSubmit={handleAdd} className="bg-admin-bg border border-admin-border rounded-xl p-4 space-y-3">
          <p className="text-white text-sm font-semibold">Nuevo administrador</p>
          <div>
            <label className={labelClass}>Nombre</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre completo"
              required
              minLength={2}
            />
          </div>
          <div>
            <label className={labelClass}>Correo electrónico</label>
            <input
              className={inputClass}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Contraseña</label>
            <input
              className={inputClass}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink text-white text-sm font-semibold hover:bg-pink/80 transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Guardar
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm({ name: '', email: '', password: '' }) }}
              className="px-4 py-2 rounded-xl text-admin-muted text-sm hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
