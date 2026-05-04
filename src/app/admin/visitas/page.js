// app/admin/visitas-pendientes/page.jsx
'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { EyeIcon, CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline'

// Datos ficticios como estado inicial (sin useEffect)
const DATOS_INICIALES = [
  {
    id: 1,
    extensionista: 'Juan Pérez',
    propietario: 'María González',
    rut: '12.345.678-9',
    region: 'Maule',
    comuna: 'Talca',
    fecha: '2024-01-15',
    hora: '14:30',
    estado: 'pendiente',
    direccion: 'Calle Los Álamos 123, Talca',
    telefono: '+56 9 1234 5678'
  },
  {
    id: 2,
    extensionista: 'Ana López',
    propietario: 'Pedro Ramírez',
    rut: '18.765.432-1',
    region: 'Ñuble',
    comuna: 'Chillán',
    fecha: '2024-01-16',
    hora: '10:00',
    estado: 'completada',
    direccion: 'Avenida Libertad 456, Chillán',
    telefono: '+56 9 8765 4321'
  },
  {
    id: 3,
    extensionista: 'Carlos Vega',
    propietario: 'Laura Martínez',
    rut: '19.876.543-2',
    region: 'Maule',
    comuna: 'Curicó',
    fecha: '2024-01-15',
    hora: '16:00',
    estado: 'pendiente',
    direccion: 'Pasaje El Sol 789, Curicó',
    telefono: '+56 9 2345 6789'
  }
]

const VisitasPendientesAdmin = () => {
  const router = useRouter()
  const [visitas, setVisitas] = useState(DATOS_INICIALES)
  const [filtroEstado, setFiltroEstado] = useState('pendiente')
  const [buscar, setBuscar] = useState('')
  const [mostrarCompletadas, setMostrarCompletadas] = useState(false)

  // Filtrar y buscar visitas (optimizado con useMemo)
  const visitasFiltradas = useMemo(() => {
    return visitas.filter(visita => {
      const coincideEstado = filtroEstado === 'todos' || visita.estado === filtroEstado
      const coincideBusqueda = 
        visita.extensionista.toLowerCase().includes(buscar.toLowerCase()) ||
        visita.propietario.toLowerCase().includes(buscar.toLowerCase()) ||
        visita.rut.includes(buscar)
      
      return coincideEstado && coincideBusqueda
    })
  }, [visitas, filtroEstado, buscar])

  // Cambiar estado de visita (optimizado con useCallback)
  const cambiarEstado = useCallback((id, nuevoEstado) => {
    setVisitas(prev => 
      prev.map(visita => 
        visita.id === id 
          ? { ...visita, estado: nuevoEstado }
          : visita
      )
    )
  }, [])

  // Ver detalle de visita
  const verDetalle = useCallback((visita) => {
    router.push(`/admin/visitas/${visita.id}`)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Visitas Pendientes
              </h1>
              <p className="text-gray-600">
                Gestiona las visitas programadas por los extensionistas
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/admin')}
                className="px-6 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 font-medium"
              >
                ← Volver
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre, RUT..."
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
              <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            >
              <option value="pendiente">Pendientes</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
              <option value="todos">Todas</option>
            </select>

            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                checked={mostrarCompletadas}
                onChange={(e) => setMostrarCompletadas(e.target.checked)}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">Mostrar completadas</span>
            </label>

            <div className="flex items-center justify-end md:justify-center lg:justify-end">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ClockIcon className="h-4 w-4" />
                <span>Total: {visitasFiltradas.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Extensionista
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Propietario
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider hidden md:table-cell">
                    RUT
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visitasFiltradas.map((visita) => (
                  <tr key={visita.id} className="hover:bg-green-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{visita.extensionista}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-32 sm:max-w-none">
                        {visita.propietario}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {visita.rut}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {visita.fecha} {visita.hora}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        visita.estado === 'pendiente' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : visita.estado === 'completada'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {visita.estado === 'pendiente' ? 'Pendiente' : 
                         visita.estado === 'completada' ? 'Completada' : 'Cancelada'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => verDetalle(visita)}
                        className="p-2 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-xl transition-all duration-200"
                        title="Ver detalle"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      
                      {visita.estado === 'pendiente' && (
                        <>
                          <button
                            onClick={() => cambiarEstado(visita.id, 'completada')}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-xl transition-all duration-200"
                            title="Marcar completada"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => cambiarEstado(visita.id, 'cancelada')}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-xl transition-all duration-200"
                            title="Cancelar"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {visitasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay visitas</h3>
              <p className="text-gray-500 mb-6">Ajusta los filtros para ver más resultados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VisitasPendientesAdmin