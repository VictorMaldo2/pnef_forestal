'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ClockIcon } from '@heroicons/react/24/outline'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export default function VisitasPendientes() {
  const router = useRouter()
  const [visitas, setVisitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filterExtensionista, setFilterExtensionista] = useState('')
  const [filterPropietario, setFilterPropietario] = useState('')
  const [filterFecha, setFilterFecha] = useState('')

  useEffect(() => {
    async function fetchVisitasPendientes() {
      setLoading(true)
      setError('')

      try {
        const res = await fetch('/api/visPendientes')
        if (!res.ok) throw new Error('Error al cargar visitas')
        const data = await res.json()
        setVisitas(data.filter(v => v.estado === 'pendiente'))
      } catch (err) {
        setError('Error al cargar visitas: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchVisitasPendientes()
  }, [])

  const visitasFiltradas = useMemo(() => {
    return visitas.filter(v => {
      return (
        v.extensionista_nombre.toLowerCase().includes(filterExtensionista.toLowerCase()) &&
        v.propietario_nombre.toLowerCase().includes(filterPropietario.toLowerCase()) &&
        (filterFecha === '' || new Date(v.fecha_visita).toLocaleDateString() === new Date(filterFecha).toLocaleDateString())
      )
    })
  }, [visitas, filterExtensionista, filterPropietario, filterFecha])

  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Listado de Visitas Pendientes', 14, 22)

    const headers = [['Extensionista', 'Propietario', 'Fecha', 'Hora', 'Estado', 'Comunidad']]

    const data = visitasFiltradas.map(v => [
      v.extensionista_nombre,
      v.propietario_nombre,
      new Date(v.fecha_visita).toLocaleDateString(),
      v.hora_visita,
      v.estado.charAt(0).toUpperCase() + v.estado.slice(1),
      v.comunidad_indigena ? (v.comunidad_nombre || 'Indígena') : 'No'
    ])

    doc.autoTable({
      startY: 30,
      head: headers,
      body: data,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [16, 185, 129] },
      theme: 'striped',
    })

    doc.save('visitas_pendientes.pdf')
  }

  async function marcarCompletada(id) {
    if(!confirm("¿Quieres marcar esta visita como completada?")) return

    try {
      const res = await fetch('/api/updVisitas', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id })
      })

      if(!res.ok){
        const errorData = await res.json()
        alert(errorData.error || 'Error al actualizar la visita')
        return
      }

      // Actualizar estado en frontend sin recargar
      setVisitas(prev => prev.map(v => v.id === id ? {...v, estado: 'completada'} : v))
      alert('Visita marcada como completada')
      
    } catch(error) {
      alert('Error en la conexión: ' + error.message)
    }
  }

  if(loading){
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-xl text-green-600">Cargando visitas pendientes...</div>
      </div>
    )
  }

  if(error){
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-3xl font-bold text-green-800">
          Visitas Pendientes
        </h1>
        <button
          onClick={exportarPDF}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition"
        >
          Exportar a PDF
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Filtrar por Extensionista"
          value={filterExtensionista}
          onChange={e => setFilterExtensionista(e.target.value)}
          className="p-2 border border-green-300 rounded"
        />
        <input
          type="text"
          placeholder="Filtrar por Propietario"
          value={filterPropietario}
          onChange={e => setFilterPropietario(e.target.value)}
          className="p-2 border border-green-300 rounded"
        />
        <input
          type="date"
          placeholder="Filtrar por Fecha"
          value={filterFecha}
          onChange={e => setFilterFecha(e.target.value)}
          className="p-2 border border-green-300 rounded"
        />
      </div>

      <div className="overflow-x-auto border border-green-200 rounded-lg shadow-md">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-green-50">
            <tr>
              {['Extensionista', 'Propietario', 'Fecha', 'Hora', 'Estado', 'Comunidad', 'Acciones'].map(header => (
                <th
                  key={header}
                  className="border border-green-200 px-4 py-3 text-left text-sm font-semibold text-green-700 uppercase whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visitasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500 font-semibold">No hay visitas para mostrar.</td>
              </tr>
            ) : (
              visitasFiltradas.map(visita => (
                <tr key={visita.id} className="hover:bg-green-50 transition-colors duration-300">
                  <td className="border border-green-200 px-4 py-3 text-sm text-gray-900">{visita.extensionista_nombre}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm text-gray-900">{visita.propietario_nombre}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm">{new Date(visita.fecha_visita).toLocaleDateString()}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm">{visita.hora_visita}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm capitalize">{visita.estado}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm">{visita.comunidad_indigena ? visita.comunidad_nombre || 'Indígena' : 'No'}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm">
                    {visita.estado === 'pendiente' && (
                      <button
                        onClick={() => marcarCompletada(visita.id)}
                        className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 text-sm"
                      >
                        Marcar Completada
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}