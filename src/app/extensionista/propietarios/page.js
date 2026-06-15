'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

export default function PropietariosAdminPage() {
  const router = useRouter()
  const [propietarios, setPropietarios]   = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [busqueda, setBusqueda]           = useState('')
  const [editPropietario, setEditPropietario] = useState(null)
  const [editNombre, setEditNombre]       = useState('')
  const [editRut, setEditRut]             = useState('')
  const [editComunidad, setEditComunidad] = useState(false)
  const [editComunidadNombre, setEditComunidadNombre] = useState('')
  const [editComuna, setEditComuna]       = useState('')
  const [editTelefono, setEditTelefono]   = useState('')
  const [editEmail, setEditEmail]         = useState('')
  const [processing, setProcessing]       = useState(false)

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

  async function handleDelete(id) {
    if (!confirm('¿Estás seguro que deseas eliminar este propietario?')) return
    try {
      const res = await fetch(`/api/extPropietarios/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error eliminando')
      }
      setPropietarios(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
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
    } catch (err) {
      alert(err.message)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-green-700 text-lg">Cargando propietarios...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-600 text-lg">{error}</p>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-green-800">Propietarios</h2>
        <button onClick={() => router.push('/extensionista/propietarios/agregar')}
      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium">
      + Agregar propietario
    </button>
        <button onClick={() => router.back()}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600">
          ← Volver
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre o RUT..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="w-full p-3 border border-green-200 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 focus:border-transparent text-sm mb-6"
      />

      {propietariosFiltrados.length === 0 ? (
        <p className="text-center text-gray-500">No se encontraron propietarios.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
          <div className="p-6 border-b border-green-100">
            <h3 className="text-xl font-semibold text-green-800">
              Lista de Propietarios ({propietariosFiltrados.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-green-50">
                <tr>
                  <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">Nombre</th>
                  <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">RUT</th>
                  <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">Comunidad</th>
                  <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">Comuna</th>
                  <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">Teléfono</th>
                  <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">Email</th>
                  <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {propietariosFiltrados.map(p => (
                  <tr key={p.id} className="hover:bg-green-50">
                    <td className="border-b border-green-50 p-4 font-medium">{p.nombre}</td>
                    <td className="border-b border-green-50 p-4">{p.rut}</td>
                    <td className="border-b border-green-50 p-4">
                      {p.comunidad_indigena
                        ? <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            {p.comunidad_nombre || 'Sí'}
                          </span>
                        : <span className="text-gray-400 text-sm">No</span>
                      }
                    </td>
                    <td className="border-b border-green-50 p-4">{p.comuna || '—'}</td>
                    <td className="border-b border-green-50 p-4">{p.telefono || '—'}</td>
                    <td className="border-b border-green-50 p-4">{p.email || '—'}</td>
                    <td className="border-b border-green-50 p-4 space-x-2">
                      <button onClick={() => openEditModal(p)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(p.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {editPropietario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-green-800">Editar Propietario</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                <input type="text" value={editNombre}
                  onChange={e => setEditNombre(e.target.value)}
                  required placeholder="Nombre"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">RUT</label>
                <input type="text" value={editRut}
                  onChange={e => setEditRut(e.target.value)}
                  required placeholder="RUT"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Comuna</label>
                <input type="text" value={editComuna}
                  onChange={e => setEditComuna(e.target.value)}
                  placeholder="Comuna"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                <input type="text" value={editTelefono}
                  onChange={e => setEditTelefono(e.target.value)}
                  placeholder="Teléfono"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input type="email" value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nombre de la comunidad
                  </label>
                  <input type="text" value={editComunidadNombre}
                    onChange={e => setEditComunidadNombre(e.target.value)}
                    placeholder="Ej: Mapuche, Aymara..."
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:outline-none" />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setEditPropietario(null)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm">
                  Cancelar
                </button>
                <button type="submit" disabled={processing}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm font-semibold">
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