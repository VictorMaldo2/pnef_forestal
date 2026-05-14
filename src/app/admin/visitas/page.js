'use client'

import { useState, useEffect, useMemo } from 'react'
import { jsPDF } from 'jspdf'

export default function VisitasPendientes() {
  const [visitas, setVisitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filtroExtensionista, setFiltroExtensionista] = useState('')
  const [filtroPropietario, setFiltroPropietario] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')

  useEffect(() => {
    async function fetchVisitas() {
      try {
        setLoading(true)
        const res = await fetch('/api/admvisitas')
        if (!res.ok) throw new Error('Error obteniendo visitas')
        const data = await res.json()
        setVisitas(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchVisitas()
  }, [])

  // Filtrado dinámico
  const visitasFiltradas = useMemo(() => {
    return visitas.filter(v => {
      return (
        (filtroExtensionista === '' || v.extensionista_nombre.toLowerCase().includes(filtroExtensionista.toLowerCase())) &&
        (filtroPropietario === '' || v.propietario_nombre.toLowerCase().includes(filtroPropietario.toLowerCase())) &&
        (filtroFecha === '' || new Date(v.fecha_visita).toLocaleDateString() === new Date(filtroFecha).toLocaleDateString())
      )
    })
  }, [visitas, filtroExtensionista, filtroPropietario, filtroFecha])

  // Exportar PDF con visitas filtradas
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
      headStyles: { fillColor: [16, 185, 129] }, // verde Tailwind emerald-500
      theme: 'striped',
    })

    doc.save('visitas.pdf')
  }

  if (loading) 
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-green-700 animate-pulse">Cargando visitas...</p>
      </div>
    )

  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600 text-lg">Error: {error}</p>
      </div>
    )

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-3xl font-bold text-green-800">
          Visitas Totales
        </h1>
        <button
          onClick={exportarPDF}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition"
          aria-label="Exportar listado a PDF"
        >
          Exportar a PDF
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Filtrar por Extensionista"
          value={filtroExtensionista}
          onChange={e => setFiltroExtensionista(e.target.value)}
          className="p-2 border border-green-300 rounded"
        />
        <input
          type="text"
          placeholder="Filtrar por Propietario"
          value={filtroPropietario}
          onChange={e => setFiltroPropietario(e.target.value)}
          className="p-2 border border-green-300 rounded"
        />
        <input
          type="date"
          placeholder="Filtrar por Fecha"
          value={filtroFecha}
          onChange={e => setFiltroFecha(e.target.value)}
          className="p-2 border border-green-300 rounded"
        />
      </div>

      <div className="overflow-x-auto border border-green-200 rounded-lg shadow-md">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-green-50">
            <tr>
              {['Extensionista', 'Propietario', 'Fecha', 'Hora', 'Estado', 'Comunidad'].map(header => (
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
                <td colSpan={6} className="py-8 text-center text-gray-500 font-semibold">
                  No hay visitas para mostrar.
                </td>
              </tr>
            ) : (
              visitasFiltradas.map(visita => (
                <tr
                  key={visita.id}
                  className="hover:bg-green-50 transition-colors duration-300"
                >
                  <td className="border border-green-200 px-4 py-3 text-sm text-gray-900">{visita.extensionista_nombre}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm text-gray-900">{visita.propietario_nombre}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm">{new Date(visita.fecha_visita).toLocaleDateString()}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm">{visita.hora_visita}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm capitalize">{visita.estado}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm">{visita.comunidad_indigena ? (visita.comunidad_nombre || 'Indígena') : 'No'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}