'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VisitasPendientes() {
  const [visitas, setVisitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function fetchVisitasPendientes() {
      setLoading(true)
      setError('')

      try {
        // Llama a tu endpoint API que consulta las visitas pendientes en PostgreSQL
        const res = await fetch('/api/visPendientes')
        if (!res.ok) throw new Error('Error al cargar visitas')
        const data = await res.json()
        setVisitas(data.filter(visita => visita.estado === 'pendiente'))
      } catch (err) {
        setError('Error al cargar visitas: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchVisitasPendientes()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-xl text-green-600">Cargando visitas pendientes...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">Visitas Pendientes</h1>
         <button
  onClick={() => router.push('/admin')}
  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
>
  ← Volver
</button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {visitas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No tienes visitas pendientes</h3>
            <p className="text-gray-500">¡Excelente trabajo! Todas tus visitas están completadas.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-green-800">
                {visitas.length} visita(s) pendiente(s)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-green-50">
                  <tr>
                    <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">Fecha</th>
                    <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">Propietario</th>
                    <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">RUT</th>
                    <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">Comuna</th>
                    <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">Descripción</th>
                    <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visitas.map((visita) => (
                    <tr key={visita.id} className="border-b hover:bg-green-50">
                      <td className="border-b border-green-50 p-4">
                        <div className="font-semibold text-lg">
                          {new Date(visita.fecha_visita).toLocaleDateString('es-CL')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(visita.fecha_visita).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="border-b border-green-50 p-4 font-medium">
                        {visita.propietario_nombre || 'Sin propietario'}
                      </td>
                      <td className="border-b border-green-50 p-4">
                        {visita.propietario_rut || 'N/D'}
                      </td>
                      <td className="border-b border-green-50 p-4">
                        {visita.propietario_comuna || 'N/D'}
                      </td>
                      <td className="border-b border-green-50 p-4 max-w-xs truncate">
                        {visita.descripcion || 'Sin descripción'}
                      </td>
                      <td className="border-b border-green-50 p-4">
                        <div className="flex space-x-2">
                          <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm">
                            Marcar Completada
                          </button>
                          <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm">
                            Ver Detalle
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
      </div>
    </div>
  )
}