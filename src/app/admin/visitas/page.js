'use client'

import { useState, useEffect, useMemo } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useRouter } from 'next/navigation'

const ESTADO_COLOR = {
  pendiente:  'bg-yellow-100 text-yellow-700',
  completada: 'bg-green-100 text-green-700',
  cancelada:  'bg-red-100 text-red-700',
}

function ModalEditar({ visita, onClose, onGuardar }) {
  const [form, setForm] = useState({
    fecha_visita:  visita.fecha_visita?.split('T')[0] || '',
    hora_visita:   visita.hora_visita || '',
    estado:        visita.estado || 'pendiente',
    actividad:     visita.actividad || '',
    observaciones: visita.observaciones || '',
  })

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleGuardar() {
    await onGuardar({ id: visita.id, ...form })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-green-800">Modificar Visita</h2>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Propietario</label>
            <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded">{visita.propietario_nombre}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Extensionista</label>
            <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded">{visita.extensionista_nombre}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
              <input type="date" name="fecha_visita" value={form.fecha_visita}
                onChange={handleChange}
                className="border p-2 rounded w-full focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hora</label>
              <input type="time" name="hora_visita" value={form.hora_visita}
                onChange={handleChange}
                className="border p-2 rounded w-full focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange}
              className="border p-2 rounded w-full focus:ring-2 focus:ring-green-500 focus:outline-none text-sm">
              <option value="pendiente">Pendiente</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div>
  <label className="block text-sm font-semibold text-gray-700 mb-1">Actividad</label>
  <select name="actividad" value={form.actividad} onChange={handleChange}
    className="border p-2 rounded w-full focus:ring-2 focus:ring-green-500 focus:outline-none text-sm">
    <option value="">Seleccione actividad</option>
    <option value="Inspección">Visita jornada marcación</option>
    <option value="Revisión">Visita talonario terreno</option>
    <option value="Mantenimiento">Visita regular</option>
    <option value="Capacitación">Capacitación</option>
  </select>
</div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Observaciones</label>
            <textarea name="observaciones" value={form.observaciones}
              onChange={handleChange} rows={3} placeholder="Observaciones"
              className="border p-2 rounded w-full focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
            Cancelar
          </button>
          <button onClick={handleGuardar}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-semibold">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VisitasTotales() {
  const router = useRouter()
  const [visitas, setVisitas]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [visitaEditar, setVisitaEditar] = useState(null)
  const [filtroExtensionista, setFiltroExtensionista] = useState('')
  const [filtroPropietario, setFiltroPropietario]     = useState('')
  const [filtroFecha, setFiltroFecha]                 = useState('')

  useEffect(() => {
    let activo = true

    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/admvisitas')
        if (!res.ok) throw new Error('Error obteniendo visitas')
        const data = await res.json()
        if (activo) setVisitas(data)
      } catch (err) {
        if (activo) setError(err.message)
      } finally {
        if (activo) setLoading(false)
      }
    }

    cargar()
    return () => { activo = false }
  }, [])

  const visitasFiltradas = useMemo(() => {
    return visitas.filter(v => {
      return (
        (filtroExtensionista === '' || v.extensionista_nombre.toLowerCase().includes(filtroExtensionista.toLowerCase())) &&
        (filtroPropietario === '' || v.propietario_nombre.toLowerCase().includes(filtroPropietario.toLowerCase())) &&
        (filtroFecha === '' || new Date(v.fecha_visita).toLocaleDateString() === new Date(filtroFecha).toLocaleDateString())
      )
    })
  }, [visitas, filtroExtensionista, filtroPropietario, filtroFecha])

  async function handleGuardar(datos) {
    try {
      const res = await fetch('/api/admvisitas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      })
      if (!res.ok) throw new Error('Error al modificar la visita')
      setVisitas(prev => prev.map(v => v.id === datos.id ? { ...v, ...datos } : v))
      alert('Visita modificada correctamente')
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta visita? Esta acción no se puede deshacer.')) return
    try {
      const res = await fetch('/api/admvisitas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (!res.ok) throw new Error('Error al eliminar la visita')
      setVisitas(prev => prev.filter(v => v.id !== id))
      alert('Visita eliminada correctamente')
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Listado de Visitas Totales', 14, 22)
    const headers = [['Extensionista', 'Propietario', 'Fecha', 'Hora', 'Estado', 'Comunidad']]
    const data = visitasFiltradas.map(v => [
      v.extensionista_nombre,
      v.propietario_nombre,
      new Date(v.fecha_visita).toLocaleDateString('es-CL'),
      v.hora_visita || '—',
      v.estado.charAt(0).toUpperCase() + v.estado.slice(1),
      v.comunidad_indigena ? (v.comunidad_nombre || 'Indígena') : 'No'
    ])
    autoTable(doc, {
      startY: 30, head: headers, body: data,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [16, 185, 129] },
      theme: 'striped',
    })
    doc.save('visitas.pdf')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg text-green-700 animate-pulse">Cargando visitas...</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-red-600 text-lg">Error: {error}</p>
    </div>
  )

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-green-800">Visitas Totales</h1>
        <div className="flex gap-3">
          <button onClick={() => router.back()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg font-semibold transition">
            ← Volver
          </button>
          <button onClick={exportarPDF}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition">
            Exportar a PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input type="text" placeholder="Filtrar por Extensionista"
          value={filtroExtensionista} onChange={e => setFiltroExtensionista(e.target.value)}
          className="p-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <input type="text" placeholder="Filtrar por Propietario"
          value={filtroPropietario} onChange={e => setFiltroPropietario(e.target.value)}
          className="p-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <input type="date" value={filtroFecha}
          onChange={e => setFiltroFecha(e.target.value)}
          className="p-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>

      {/* Contador */}
      <p className="text-sm text-gray-500 mb-4">
        Mostrando <span className="font-semibold text-green-700">{visitasFiltradas.length}</span> de{' '}
        <span className="font-semibold">{visitas.length}</span> visitas
      </p>

      {/* Tabla */}
      <div className="overflow-x-auto border border-green-200 rounded-lg shadow-md">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-green-50">
            <tr>
              {['Extensionista', 'Propietario', 'Fecha', 'Hora', 'Estado', 'Comunidad', 'Acciones'].map(h => (
                <th key={h}
                  className="border border-green-200 px-4 py-3 text-left text-sm font-semibold text-green-700 uppercase whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visitasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500 font-semibold">
                  No hay visitas para mostrar.
                </td>
              </tr>
            ) : (
              visitasFiltradas.map(visita => (
                <tr key={visita.id} className="hover:bg-green-50 transition-colors">
                  <td className="border border-green-200 px-4 py-3 text-sm">{visita.extensionista_nombre}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm">{visita.propietario_nombre}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm whitespace-nowrap">
                    {new Date(visita.fecha_visita).toLocaleDateString('es-CL')}
                  </td>
                  <td className="border border-green-200 px-4 py-3 text-sm">{visita.hora_visita || '—'}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${ESTADO_COLOR[visita.estado] || 'bg-gray-100 text-gray-600'}`}>
                      {visita.estado}
                    </span>
                  </td>
                  <td className="border border-green-200 px-4 py-3 text-sm">
                    {visita.comunidad_indigena ? visita.comunidad_nombre || 'Indígena' : 'No'}
                  </td>
                  <td className="border border-green-200 px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => setVisitaEditar(visita)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs font-medium transition">
                        Modificar
                      </button>
                      <button onClick={() => handleEliminar(visita.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs font-medium transition">
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

      {/* Modal editar */}
      {visitaEditar && (
        <ModalEditar
          visita={visitaEditar}
          onClose={() => setVisitaEditar(null)}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  )
}