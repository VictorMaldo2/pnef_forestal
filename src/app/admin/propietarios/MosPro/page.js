'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

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
    success: { btn: 'bg-green-600 hover:bg-green-700', icono: '✓', titulo: 'text-green-700' },
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

export default function PropietariosAdminPage() {
  const router = useRouter()
  const [propietarios, setPropietarios]       = useState([])
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState('')
  const [busqueda, setBusqueda]               = useState('')
  const [editPropietario, setEditPropietario] = useState(null)
  const [editNombre, setEditNombre]           = useState('')
  const [editRut, setEditRut]                 = useState('')
  const [editComunidad, setEditComunidad]     = useState(false)
  const [editComunidadNombre, setEditComunidadNombre] = useState('')
  const [editComuna, setEditComuna]           = useState('')
  const [editTelefono, setEditTelefono]       = useState('')
  const [editEmail, setEditEmail]             = useState('')
  const [processing, setProcessing]           = useState(false)
  const [notificacion, setNotificacion]       = useState(null)
  const [modalConfirmar, setModalConfirmar]   = useState(null)

  useEffect(() => {
    if (!notificacion) return
    const t = setTimeout(() => setNotificacion(null), 3000)
    return () => clearTimeout(t)
  }, [notificacion])

  function mostrarNotificacion(mensaje, tipo = 'success') {
    setNotificacion({ mensaje, tipo })
  }

  useEffect(() => {
    async function fetchPropietarios() {
      try {
        setLoading(true)
        const res = await fetch('/api/extPropietarios')
        if (!res.ok) throw new Error('Error al obtener propietarios')
        const data = await res.json()
        setPropietarios(data)
      } catch (err) {
        setError('Error al cargar propietarios: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPropietarios()
  }, [])

  const propietariosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase()
    return propietarios.filter(
      p =>
        p.nombre.toLowerCase().includes(q) ||
        p.rut.toLowerCase().includes(q)
    )
  }, [busqueda, propietarios])

  function confirmarDelete(id) {
    setModalConfirmar({
      titulo:       '¿Eliminar propietario?',
      mensaje:      'Esta acción eliminará permanentemente al propietario. ¿Estás seguro?',
      btnConfirmar: 'Sí, eliminar',
      tipo:         'danger',
      accion:       async () => {
        try {
          const res = await fetch(`/api/extPropietarios/${id}`, { method: 'DELETE' })
          if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || 'Error eliminando')
          }
          setPropietarios(prev => prev.filter(p => p.id !== id))
          mostrarNotificacion('Propietario eliminado correctamente', 'warning')
        } catch (err) {
          mostrarNotificacion('Error al eliminar: ' + err.message, 'error')
        }
      }
    })
  }

  async function ejecutarConfirmacion() {
    const accion = modalConfirmar?.accion
    setModalConfirmar(null)
    if (accion) await accion()
  }

  function openEditModal(p) {
    setEditPropietario(p)
    setEditNombre(p.nombre)
    setEditRut(p.rut)
    setEditComunidad(Boolean(p.comunidad_indigena))
    setEditComunidadNombre(p.comunidad_nombre || '')
    setEditComuna(p.comuna || '')
    setEditTelefono(p.telefono || '')
    setEditEmail(p.email || '')
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    setProcessing(true)
    try {
      const res = await fetch(`/api/extPropietarios/${editPropietario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre:             editNombre,
          rut:                editRut,
          comunidad_indigena: editComunidad,
          comunidad_nombre:   editComunidad ? editComunidadNombre : '',
          comuna:             editComuna,
          telefono:           editTelefono,
          email:              editEmail,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error editando')
      }

      const updated = await res.json()
      setPropietarios(prev => prev.map(p => (p.id === updated.id ? updated : p)))
      setEditPropietario(null)
      mostrarNotificacion('Propietario actualizado correctamente', 'success')
    } catch (err) {
      mostrarNotificacion('Error: ' + err.message, 'error')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <p className="text-green-700 text-lg text-center">Cargando propietarios...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <p className="text-red-600 text-lg text-center">{error}</p>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

      <Notificacion notificacion={notificacion} />
      <ModalConfirmar
        config={modalConfirmar}
        onConfirmar={ejecutarConfirmacion}
        onCancelar={() => setModalConfirmar(null)}
      />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-green-800">Propietarios</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => router.push('/admin/propietarios/agregar')}
            className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 font-medium text-sm sm:text-base whitespace-nowrap">
             Agregar propietario
          </button>
          <button onClick={() => router.back()}
            className="bg-gray-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-600 text-sm sm:text-base whitespace-nowrap">
            ← Volver
          </button>
        </div>
      </div>

      <input type="text" placeholder="Buscar por nombre o RUT..."
        value={busqueda} onChange={e => setBusqueda(e.target.value)}
        className="w-full p-3 border border-green-200 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 focus:border-transparent text-sm mb-6" />

      {propietariosFiltrados.length === 0 ? (
        <p className="text-center text-gray-500">No se encontraron propietarios.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-green-100">
            <h3 className="text-lg sm:text-xl font-semibold text-green-800">
              Lista de Propietarios ({propietariosFiltrados.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-green-50">
                <tr>
                  <th className="border-b border-green-100 p-3 sm:p-4 text-left text-green-800 font-semibold whitespace-nowrap">Nombre</th>
                  <th className="border-b border-green-100 p-3 sm:p-4 text-left text-green-800 font-semibold whitespace-nowrap">RUT</th>
                  <th className="border-b border-green-100 p-3 sm:p-4 text-left text-green-800 font-semibold whitespace-nowrap hidden md:table-cell">Comunidad</th>
                  <th className="border-b border-green-100 p-3 sm:p-4 text-left text-green-800 font-semibold whitespace-nowrap hidden sm:table-cell">Comuna</th>
                  <th className="border-b border-green-100 p-3 sm:p-4 text-left text-green-800 font-semibold whitespace-nowrap hidden lg:table-cell">Teléfono</th>
                  <th className="border-b border-green-100 p-3 sm:p-4 text-left text-green-800 font-semibold whitespace-nowrap hidden lg:table-cell">Email</th>
                  <th className="border-b border-green-100 p-3 sm:p-4 text-left text-green-800 font-semibold whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {propietariosFiltrados.map(p => (
                  <tr key={p.id} className="hover:bg-green-50">
                    <td className="border-b border-green-50 p-3 sm:p-4 font-medium whitespace-nowrap">{p.nombre}</td>
                    <td className="border-b border-green-50 p-3 sm:p-4 whitespace-nowrap">{p.rut}</td>
                    <td className="border-b border-green-50 p-3 sm:p-4 hidden md:table-cell">
                      {p.comunidad_indigena
                        ? <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            {p.comunidad_nombre || 'Sí'}
                          </span>
                        : <span className="text-gray-400 text-sm">No</span>
                      }
                    </td>
                    <td className="border-b border-green-50 p-3 sm:p-4 hidden sm:table-cell">{p.comuna || '—'}</td>
                    <td className="border-b border-green-50 p-3 sm:p-4 hidden lg:table-cell">{p.telefono || '—'}</td>
                    <td className="border-b border-green-50 p-3 sm:p-4 hidden lg:table-cell">{p.email || '—'}</td>
                    <td className="border-b border-green-50 p-3 sm:p-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(p)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs sm:text-sm whitespace-nowrap">
                          Editar
                        </button>
                        <button onClick={() => confirmarDelete(p.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs sm:text-sm whitespace-nowrap">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editPropietario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-green-800">Editar Propietario</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)}
                  required placeholder="Nombre"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">RUT</label>
                <input type="text" value={editRut} onChange={e => setEditRut(e.target.value)}
                  required placeholder="RUT"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Comuna</label>
                <input type="text" value={editComuna} onChange={e => setEditComuna(e.target.value)}
                  placeholder="Comuna"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                <input type="text" value={editTelefono} onChange={e => setEditTelefono(e.target.value)}
                  placeholder="Teléfono"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Comunidad indígena</label>
                <select value={editComunidad}
                  onChange={e => {
                    setEditComunidad(e.target.value === 'true')
                    if (e.target.value === 'false') setEditComunidadNombre('')
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:outline-none">
                  <option value="false">No pertenece a comunidad</option>
                  <option value="true">Pertenece a comunidad</option>
                </select>
              </div>
              {editComunidad && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de la comunidad</label>
                  <input type="text" value={editComunidadNombre}
                    onChange={e => setEditComunidadNombre(e.target.value)}
                    placeholder="Ej: Mapuche, Aymara..."
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:outline-none" />
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditPropietario(null)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm order-2 sm:order-1">
                  Cancelar
                </button>
                <button type="submit" disabled={processing}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm font-semibold order-1 sm:order-2">
                  {processing ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}