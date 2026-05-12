'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default function ExtensionistaDashboard() {
  const router = useRouter()
  const [busqueda, setBusqueda] = useState('')
  const [propietarios, setPropietarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Cargar datos reales al montar
  useEffect(() => {
    async function loadPropietarios() {
      try {
        setLoading(true)
        const res = await fetch('/api/admpropietarios')
        if (!res.ok) {
          throw new Error('Error al obtener propietarios')
        }
        const data = await res.json()
        setPropietarios(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadPropietarios()
  }, [])

  // Filtrado por busqueda
  const propietariosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase()
    return propietarios.filter(
      p =>
        p.nombre.toLowerCase().includes(q) || p.rut.includes(busqueda)
    )
  }, [busqueda, propietarios])

  // Exportar PDF desde datos actuales
  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('Listado de Propietarios', 14, 20)

    const headers = [['#', 'Nombre', 'RUT', 'Comunidad', 'Género', 'Comuna', 'Tipo', 'Visitas Pendientes']]
    // Los datos en filas
    const data = propietariosFiltrados.map((p, i) => [
      i + 1,
      p.nombre || 'N/A',
      p.rut || 'N/A',
      p.comunidad_indigena ? (p.comunidad_indigena || 'Indígena') : 'No',
      p.genero || 'N/A',
      p.comuna || 'N/A',
      p.tipo_propietario || 'N/A',
      p.visitas_pendientes ?? 0
    ])

    doc.autoTable({
      startY: 30,
      head: headers,
      body: data,
      headStyles: { fillColor: [16, 185, 129] }, // verde Tailwind emerald-500
      styles: { fontSize: 9 },
      theme: 'striped',
      margin: { left: 10, right: 10 }
    })

    doc.save('propietarios_pnef.pdf')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-green-700 animate-pulse text-lg">Cargando propietarios...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 lg:gap-0 mb-6 pb-6 border-b border-green-100">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 leading-tight">
              Panel Administrativo
            </h1>
            <p className="text-green-600 text-sm sm:text-base mt-1">Gestión de propietarios</p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="w-full lg:w-auto bg-green-600 text-white rounded-lg px-4 py-2.5 hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
          >
            ← Volver
          </button>
        </div>

        {/* Indicadores de cantidad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold mb-1 text-gray-800">Propietarios</h3>
                <p className="text-3xl sm:text-4xl lg:text-4xl font-bold text-green-600">{propietarios.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">👥</span>
              </div>
            </div>
          </div>
          {/* Aquí puedes agregar más indicadores si tienes */}
        </div>

        {/* Buscador */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 text-lg">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Buscar propietario por nombre o RUT..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-green-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-400 shadow-sm text-sm transition-all"
            />
          </div>
        </div>

        {/* Botón exportar PDF */}
        <div className="mb-8">
          <button
            onClick={exportarPDF}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl text-sm font-semibold"
          >
            📄 Exportar listado a PDF
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-green-100 bg-gradient-to-r from-green-50 to-green-100">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-800">
              Propietarios ({propietariosFiltrados.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-green-100">
              <thead className="bg-green-50/50">
                <tr>
                  <th className="px-4 py-4 sm:px-6 lg:px-8 text-left text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-4 sm:px-6 lg:px-8 text-left text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wider hidden md:table-cell">
                    RUT
                  </th>
                  <th className="px-4 py-4 sm:px-6 lg:px-8 text-left text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wider hidden lg:table-cell">
                    Comunidad
                  </th>
                  <th className="px-4 py-4 sm:px-6 lg:px-8 text-left text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wider hidden sm:table-cell">
                    Comuna
                  </th>
                  <th className="px-4 py-4 sm:px-6 lg:px-8 text-left text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wider hidden md:table-cell">
                    Tipo
                  </th>
                  <th className="px-4 py-4 sm:px-6 lg:px-8 text-left text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wider">
                    Visitas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {propietariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-500">
                      <div className="text-lg sm:text-xl">No se encontraron propietarios</div>
                      <div className="text-sm mt-1">Intenta con otro término de búsqueda</div>
                    </td>
                  </tr>
                ) : (
                  propietariosFiltrados.map(propietario => (
                    <tr
                      key={propietario.id}
                      className="hover:bg-green-50/50 transition-all"
                    >
                      <td className="px-4 py-5 sm:px-6 lg:px-8 font-medium text-gray-900 text-sm">
                        {propietario.nombre}
                      </td>
                      <td className="px-4 py-5 sm:px-6 lg:px-8 text-gray-700 text-sm hidden md:table-cell">
                        {propietario.rut}
                      </td>
                      <td className="px-4 py-5 sm:px-6 lg:px-8 hidden lg:table-cell">
                        {propietario.comunidad_indigena ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {propietario.comunidad_indigena}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-5 sm:px-6 lg:px-8 text-gray-700 text-sm hidden sm:table-cell">
                        {propietario.comuna}
                      </td>
                      <td className="px-4 py-5 sm:px-6 lg:px-8 text-gray-700 text-sm hidden md:table-cell">
                        {propietario.tipo_propietario}
                      </td>
                      <td className="px-4 py-5 sm:px-6 lg:px-8">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs sm:text-sm font-semibold">
                          {propietario.visitas_pendientes}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}