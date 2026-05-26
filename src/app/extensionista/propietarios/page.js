'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, PlusIcon, UsersIcon, CalendarIcon, DocumentTextIcon, CogIcon } from '@heroicons/react/24/outline'

export default function PropietariosAdminPage() {
  const router = useRouter()
  const [propietarios, setPropietarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')

  // Estados para edición
  const [editPropietario, setEditPropietario] = useState(null)
  const [editNombre, setEditNombre] = useState('')
  const [editRut, setEditRut] = useState('')
  const [editComunidad, setEditComunidad] = useState(false)
  const [editComuna, setEditComuna] = useState('')
  const [processing, setProcessing] = useState(false)

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
    setEditComuna(p.comuna)
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    setProcessing(true)
    try {
      const res = await fetch(`/api/extPropietarios/${editPropietario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: editNombre,
          rut: editRut,
          comunidad_indigena: editComunidad,
          comuna: editComuna,
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-green-700 text-lg">Cargando propietarios...</p></div>
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-red-600 text-lg">{error}</p></div>
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-green-800">Propietarios</h2>
        <button onClick={() => router.back()} className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600">
          ← Volver
        </button>
        <button 
            onClick={() => router.push('/extensionista/propietarios/agregar')}
            className="w-full lg:w-auto flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            <PlusIcon className="h-5 w-5" />
            Nuevo Propietario
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
            <h3 className="text-xl font-semibold text-green-800">Lista de Propietarios ({propietariosFiltrados.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-green-50">
                <tr>
                  <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">Nombre</th>
                  <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">RUT</th>
                  <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">Comunidad</th>
                  <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">Comuna</th>
                  <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {propietariosFiltrados.map(p => (
                  <tr key={p.id} className="hover:bg-green-50">
                    <td className="border-b border-green-50 p-4 font-medium">{p.nombre}</td>
                    <td className="border-b border-green-50 p-4">{p.rut}</td>
                    <td className="border-b border-green-50 p-4">{p.comunidad_indigena ? (p.comunidad_nombre || 'Sí') : 'No'}</td>
                    <td className="border-b border-green-50 p-4">{p.comuna}</td>
                    <td className="border-b border-green-50 p-4 space-x-2">
                      <button onClick={() => openEditModal(p)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">Editar</button>
                      <button onClick={() => handleDelete(p.id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm">Eliminar</button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Editar Propietario</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)} required placeholder="Nombre" className="w-full p-2 border rounded" />
              <input type="text" value={editRut} onChange={e => setEditRut(e.target.value)} required placeholder="RUT" className="w-full p-2 border rounded" />
              <select value={editComunidad} onChange={e => setEditComunidad(e.target.value === 'true')} className="w-full p-2 border rounded">
                <option value="false">No Pertenece a Comunidad</option>
                <option value="true">Pertenece a Comunidad</option>
              </select>
              <input type="text" value={editComuna} onChange={e => setEditComuna(e.target.value)} placeholder="Comuna" className="w-full p-2 border rounded" />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setEditPropietario(null)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
                <button type="submit" disabled={processing} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">{processing ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}