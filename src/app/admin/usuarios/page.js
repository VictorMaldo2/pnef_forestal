'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, UserIcon, EnvelopeIcon, IdentificationIcon, PlusIcon } from '@heroicons/react/24/outline'

const ROL_COLOR = {
  'Administrador': 'bg-purple-100 text-purple-700',
  'Extensionista':  'bg-green-100 text-green-700',
  'Sin rol':        'bg-gray-100 text-gray-500',
}

const FORM_VACIO = {
  email: '', password: '', nombre: '',
  rut: '', telefono: '', role_id: '2'
}

function Notificacion({ notificacion }) {
  if (!notificacion) return null
  const estilos = {
    success: 'bg-green-50 border-green-400 text-green-800',
    error:   'bg-red-50 border-red-400 text-red-800',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
  }
  const iconos = { success: '✓', error: '✕', warning: '⚠' }
  return (
    <div className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-[100] flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl border shadow-lg max-w-[calc(100vw-2rem)] ${estilos[notificacion.tipo]}`}>
      <span className="text-lg font-bold">{iconos[notificacion.tipo]}</span>
      <p className="text-sm font-medium">{notificacion.mensaje}</p>
    </div>
  )
}

function ModalConfirmar({ config, onConfirmar, onCancelar }) {
  if (!config) return null
  const estilos = {
    danger:  { btn: 'bg-red-600 hover:bg-red-700',    icono: '⚠', titulo: 'text-red-700' },
  }
  const estilo = estilos[config.tipo] || estilos.danger
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{estilo.icono}</span>
          <h3 className={`text-lg font-bold ${estilo.titulo}`}>{config.titulo}</h3>
        </div>
        <p className="text-sm text-gray-600">{config.mensaje}</p>
        <div className="flex gap-3 pt-2">
          <button onClick={onCancelar}
            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
            Cancelar
          </button>
          <button onClick={onConfirmar}
            className={`flex-1 text-white py-2 rounded-lg transition text-sm font-semibold ${estilo.btn}`}>
            {config.btnConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalUsuario({ usuario, onClose, onGuardar }) {
  const esEdicion = !!usuario
  const [form, setForm] = useState(
    esEdicion ? {
      email:    usuario.email || '',
      password: '',
      nombre:   usuario.nombre || '',
      rut:      usuario.rut || '',
      telefono: usuario.telefono || '',
      role_id:  usuario.role_id?.toString() || '2'
    } : { ...FORM_VACIO }
  )
  const [guardando, setGuardando] = useState(false)
  const [error, setError]         = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleGuardar() {
    setError('')
    setGuardando(true)
    try {
      await onGuardar(esEdicion ? { id: usuario.id, ...form } : form)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const inputClass = "border p-2 rounded w-full focus:ring-2 focus:ring-green-500 focus:outline-none text-sm text-gray-800 placeholder-gray-400"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl font-bold text-green-800">
            {esEdicion ? 'Modificar Usuario' : 'Agregar Usuario'}
          </h2>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none shrink-0 ml-2">✕</button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input type="text" name="nombre" value={form.nombre}
              onChange={handleChange} placeholder="Nombre completo" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="correo@ejemplo.com" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {esEdicion ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}{!esEdicion && <span className="text-red-500"> *</span>}
            </label>
            <input type="password" name="password" value={form.password}
              onChange={handleChange} placeholder={esEdicion ? 'Nueva contraseña (opcional)' : 'Contraseña'}
              className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                RUT <span className="text-red-500">*</span>
              </label>
              <input type="text" name="rut" value={form.rut}
                onChange={handleChange} placeholder="12345678-9" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
              <input type="text" name="telefono" value={form.telefono}
                onChange={handleChange} placeholder="+56912345678" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Rol <span className="text-red-500">*</span>
            </label>
            <select name="role_id" value={form.role_id} onChange={handleChange} className={inputClass}>
              <option value="2">Extensionista</option>
              <option value="1">Administrador</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t">
          <button onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium order-2 sm:order-1">
            Cancelar
          </button>
          <button onClick={handleGuardar} disabled={guardando}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-semibold disabled:opacity-50 order-1 sm:order-2">
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsuarios() {
  const router = useRouter()
  const [usuarios, setUsuarios]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [usuarioModal, setUsuarioModal]   = useState(null)
  const [modalAbierto, setModalAbierto]   = useState(false)
  const [notificacion, setNotificacion]   = useState(null)
  const [modalConfirmar, setModalConfirmar] = useState(null)

  useEffect(() => {
    if (!notificacion) return
    const t = setTimeout(() => setNotificacion(null), 3000)
    return () => clearTimeout(t)
  }, [notificacion])

  function mostrarNotificacion(mensaje, tipo = 'success') {
    setNotificacion({ mensaje, tipo })
  }

  useEffect(() => {
    let activo = true
    async function cargar() {
      try {
        const res = await fetch('/api/usuarios')
        if (!res.ok) throw new Error('Error al obtener usuarios')
        const data = await res.json()
        if (activo) setUsuarios(data)
      } catch (err) {
        if (activo) setError(err.message)
      } finally {
        if (activo) setLoading(false)
      }
    }
    cargar()
    return () => { activo = false }
  }, [])

  async function handleGuardar(datos) {
    const esEdicion = !!datos.id
    const res = await fetch('/api/usuarios', {
      method: esEdicion ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })

    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Error desconocido')

    if (esEdicion) {
      setUsuarios(prev => prev.map(u => u.id === datos.id ? {
        ...u,
        email:    datos.email,
        nombre:   datos.nombre,
        rut:      datos.rut,
        telefono: datos.telefono,
        role_id:  parseInt(datos.role_id),
        rol:      datos.role_id === '1' ? 'Administrador' : 'Extensionista'
      } : u))
      mostrarNotificacion('Usuario modificado correctamente', 'success')
    } else {
      const res2 = await fetch('/api/usuarios')
      const data = await res2.json()
      setUsuarios(data)
      mostrarNotificacion('Usuario creado correctamente', 'success')
    }
  }

  function confirmarEliminar(id) {
    setModalConfirmar({
      titulo:       '¿Eliminar usuario?',
      mensaje:      'Esta acción eliminará permanentemente al usuario. ¿Estás seguro?',
      btnConfirmar: 'Sí, eliminar',
      tipo:         'danger',
      accion:       async () => {
        try {
          const res = await fetch('/api/usuarios', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          })
          const json = await res.json()
          if (!res.ok) throw new Error(json.error || 'Error al eliminar')
          setUsuarios(prev => prev.filter(u => u.id !== id))
          mostrarNotificacion('Usuario eliminado correctamente', 'warning')
        } catch (error) {
          mostrarNotificacion('Error: ' + error.message, 'error')
        }
      }
    })
  }

  async function ejecutarConfirmacion() {
    const accion = modalConfirmar?.accion
    setModalConfirmar(null)
    if (accion) await accion()
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600 font-medium">Cargando usuarios...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Error al cargar</h2>
        <p className="text-gray-600 mb-8">{error}</p>
        <button onClick={() => window.location.reload()}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition font-semibold">
          Reintentar
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        <Notificacion notificacion={notificacion} />
        <ModalConfirmar
          config={modalConfirmar}
          onConfirmar={ejecutarConfirmacion}
          onCancelar={() => setModalConfirmar(null)}
        />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8 pb-6 border-b border-green-100">
          <div className="flex-1">
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent leading-tight">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Administra todos los usuarios del sistema
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition font-medium shadow-lg text-sm">
              <ArrowLeftIcon className="h-5 w-5" />
              Volver
            </button>
            <button onClick={() => { setUsuarioModal(null); setModalAbierto(true) }}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition font-medium shadow-lg text-sm">
              <PlusIcon className="h-5 w-5" />
              Agregar
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-green-100 overflow-hidden">
          <div className="px-4 py-6 sm:px-8 sm:py-8 border-b border-green-50 bg-gradient-to-r from-green-50 to-green-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
                <UserIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                  Lista de Usuarios ({usuarios.length})
                </h2>
                <p className="text-green-600 text-sm">Total de usuarios registrados</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-green-50">
              <thead className="bg-gradient-to-r from-green-600/10 to-green-700/10">
                <tr>
                  <th className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 text-left text-xs font-semibold text-green-800 uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center gap-2"><IdentificationIcon className="h-4 w-4" />ID</div>
                  </th>
                  <th className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 text-left text-xs font-semibold text-green-800 uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center gap-2"><UserIcon className="h-4 w-4" />Nombre</div>
                  </th>
                  <th className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 text-left text-xs font-semibold text-green-800 uppercase tracking-wider hidden md:table-cell whitespace-nowrap">
                    <div className="flex items-center gap-2"><EnvelopeIcon className="h-4 w-4" />Email</div>
                  </th>
                  <th className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 text-left text-xs font-semibold text-green-800 uppercase tracking-wider hidden sm:table-cell whitespace-nowrap">RUT</th>
                  <th className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 text-left text-xs font-semibold text-green-800 uppercase tracking-wider hidden lg:table-cell whitespace-nowrap">Teléfono</th>
                  <th className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 text-left text-xs font-semibold text-green-800 uppercase tracking-wider whitespace-nowrap">Rol</th>
                  <th className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 text-left text-xs font-semibold text-green-800 uppercase tracking-wider whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-16 px-4">
                      <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-500 mb-2">No hay usuarios</h3>
                      <p className="text-gray-400 text-sm">No se han registrado usuarios aún</p>
                    </td>
                  </tr>
                ) : (
                  usuarios.map(user => (
                    <tr key={user.id} className="hover:bg-green-50/50 transition-all group">
                      <td className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 whitespace-nowrap">
                          #{user.id.toString().slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <UserIcon className="h-4 w-4 text-indigo-600" />
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{user.nombre || '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 hidden md:table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <EnvelopeIcon className="h-4 w-4 text-green-600" />
                          </div>
                          <p className="text-sm text-gray-700">{user.email || '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 text-sm text-gray-700 hidden sm:table-cell">{user.rut || '—'}</td>
                      <td className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 text-sm text-gray-700 hidden lg:table-cell">{user.telefono || '—'}</td>
                      <td className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${ROL_COLOR[user.rol] || 'bg-gray-100 text-gray-500'}`}>
                          {user.rol}
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
                        <div className="flex gap-2">
                          <button onClick={() => { setUsuarioModal(user); setModalAbierto(true) }}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs font-medium transition whitespace-nowrap">
                            Modificar
                          </button>
                          <button onClick={() => confirmarEliminar(user.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs font-medium transition whitespace-nowrap">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalAbierto && (
        <ModalUsuario
          usuario={usuarioModal}
          onClose={() => { setModalAbierto(false); setUsuarioModal(null) }}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  )
}