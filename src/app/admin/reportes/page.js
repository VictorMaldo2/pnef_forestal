'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const ESTADO_COLOR = {
  pendiente:  'bg-yellow-100 text-yellow-700',
  completada: 'bg-green-100 text-green-700',
  cancelada:  'bg-red-100 text-red-700',
}

function ModalVisitas({ propietario, onClose }) {
  const [visitas, setVisitas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!propietario) return
    async function fetchVisitas() {
      try {
        const res = await fetch(`/api/visitas_propietarios?propietario_id=${propietario.id}`)
        if (!res.ok) throw new Error('Error cargando visitas')
        const data = await res.json()
        setVisitas(data)
      } catch (error) {
        alert(error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchVisitas()
  }, [propietario])

  if (!propietario) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <p className="text-sm text-gray-500">Visitas de</p>
            <h2 className="text-xl font-bold text-green-800">{propietario.nombre}</h2>
            <p className="text-sm text-gray-400">{propietario.rut}</p>
          </div>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none">
            ✕
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center text-gray-400 py-10">Cargando visitas...</p>
          ) : visitas.length === 0 ? (
            <p className="text-center text-gray-400 py-10">Este propietario no tiene visitas registradas.</p>
          ) : (
            <div className="space-y-4">
              {/* Resumen */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {['pendiente', 'completada', 'cancelada'].map(estado => (
                  <div key={estado} className={`rounded-lg p-3 text-center ${ESTADO_COLOR[estado] || 'bg-gray-100'}`}>
                    <p className="text-2xl font-bold">
                      {visitas.filter(v => v.estado === estado).length}
                    </p>
                    <p className="text-xs capitalize">{estado}s</p>
                  </div>
                ))}
              </div>

              {/* Lista de visitas */}
              {visitas.map(v => (
                <div key={v.id} className="border rounded-lg p-4 space-y-2 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700">
                        {v.fecha_visita
                          ? new Date(v.fecha_visita).toLocaleDateString('es-CL')
                          : '—'}
                      </span>
                      {v.hora_visita && (
                        <span className="text-xs text-gray-400">{v.hora_visita}</span>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${ESTADO_COLOR[v.estado] || 'bg-gray-100 text-gray-600'}`}>
                      {v.estado || '—'}
                    </span>
                  </div>

                  {v.actividad && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-gray-400 shrink-0">Actividad:</span>
                      <span className="text-gray-700 font-medium">{v.actividad}</span>
                    </div>
                  )}

                  {v.extensionista_nombre && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-gray-400 shrink-0">Extensionista:</span>
                      <span className="text-gray-700">{v.extensionista_nombre}</span>
                    </div>
                  )}

                  {v.observaciones && (
                    <div className="text-sm bg-gray-50 rounded p-2 text-gray-600">
                      <span className="text-gray-400 block mb-1">Observaciones:</span>
                      {v.observaciones}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ExtensionistaDashboard() {
  const router = useRouter()
  const [busqueda, setBusqueda] = useState('')
  const [propietarios, setPropietarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [propietarioModal, setPropietarioModal] = useState(null)

  useEffect(() => {
    async function loadPropietarios() {
      try {
        setLoading(true)
        const res = await fetch('/api/admpropietarios')
        if (!res.ok) throw new Error('Error al obtener propietarios')
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

  const propietariosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase()
    return propietarios.filter(
      p => p.nombre.toLowerCase().includes(q) || p.rut.includes(busqueda)
    )
  }, [busqueda, propietarios])

  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('Listado de Propietarios', 14, 20)
    const headers = [['#', 'Nombre', 'RUT', 'Comunidad', 'Género', 'Comuna', 'Tipo', 'Visitas Pendientes']]
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
    autoTable(doc, {
      startY: 30, head: headers, body: data,
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9 }, theme: 'striped',
      margin: { left: 10, right: 10 }
    })
    doc.save('propietarios_pnef.pdf')
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-green-700 animate-pulse text-lg">Cargando propietarios...</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-600 text-lg">Error: {error}</p>
    </div>
  )

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
          <button onClick={() => router.push('/admin')}
            className="w-full lg:w-auto bg-green-600 text-white rounded-lg px-4 py-2.5 hover:bg-green-700 transition-colors text-sm font-medium shadow-sm">
            ← Volver
          </button>
        </div>

        {/* Indicadores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold mb-1 text-gray-800">Propietarios</h3>
                <p className="text-3xl sm:text-4xl font-bold text-green-600">{propietarios.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">👥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 text-lg">🔍</span>
            </div>
            <input type="text" placeholder="Buscar propietario por nombre o RUT..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-green-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-400 shadow-sm text-sm transition-all" />
          </div>
        </div>

        {/* Exportar PDF */}
        <div className="mb-8">
          <button onClick={exportarPDF}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg text-sm font-semibold">
            📄 Exportar listado a PDF
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-green-100 bg-gradient-to-r from-green-50 to-green-100">
            <h2 className="text-xl sm:text-2xl font-bold text-green-800">
              Propietarios ({propietariosFiltrados.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-green-100">
              <thead className="bg-green-50/50">
                <tr>
                  <th className="px-4 py-4 sm:px-6 lg:px-8 text-left text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-4 sm:px-6 lg:px-8 text-left text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wider hidden md:table-cell">RUT</th>
                  <th className="px-4 py-4 sm:px-6 lg:px-8 text-left text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wider hidden lg:table-cell">Comunidad</th>
                  <th className="px-4 py-4 sm:px-6 lg:px-8 text-left text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wider hidden sm:table-cell">Comuna</th>
                  <th className="px-4 py-4 sm:px-6 lg:px-8 text-left text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wider hidden md:table-cell">Tipo</th>
                  <th className="px-4 py-4 sm:px-6 lg:px-8 text-left text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wider">Visitas</th>
                  <th className="px-4 py-4 sm:px-6 lg:px-8 text-left text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wider">Ver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {propietariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-500">
                      <div className="text-lg">No se encontraron propietarios</div>
                      <div className="text-sm mt-1">Intenta con otro término de búsqueda</div>
                    </td>
                  </tr>
                ) : (
                  propietariosFiltrados.map(propietario => (
                    <tr key={propietario.id} className="hover:bg-green-50/50 transition-all">
                      <td className="px-4 py-5 sm:px-6 lg:px-8 font-medium text-gray-900 text-sm">{propietario.nombre}</td>
                      <td className="px-4 py-5 sm:px-6 lg:px-8 text-gray-700 text-sm hidden md:table-cell">{propietario.rut}</td>
                      <td className="px-4 py-5 sm:px-6 lg:px-8 hidden lg:table-cell">
                        {propietario.comunidad_indigena ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">{propietario.comunidad_indigena}</span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">No</span>
                        )}
                      </td>
                      <td className="px-4 py-5 sm:px-6 lg:px-8 text-gray-700 text-sm hidden sm:table-cell">{propietario.comuna}</td>
                      <td className="px-4 py-5 sm:px-6 lg:px-8 text-gray-700 text-sm hidden md:table-cell">{propietario.tipo_propietario}</td>
                      <td className="px-4 py-5 sm:px-6 lg:px-8">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs sm:text-sm font-semibold">
                          {propietario.visitas_pendientes}
                        </span>
                      </td>
                      <td className="px-4 py-5 sm:px-6 lg:px-8">
                        <button
                          onClick={() => setPropietarioModal(propietario)}
                          className="bg-green-600 text-white text-xs px-3 py-1.5 rounded hover:bg-green-700 transition"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal visitas */}
      <ModalVisitas
        propietario={propietarioModal}
        onClose={() => setPropietarioModal(null)}
      />
    </div>
  )
}