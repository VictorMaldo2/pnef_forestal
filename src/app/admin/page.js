'use client'

import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()

  // Datos simulados para mostrar estadísticas
  const totalPropietarios = 156
  const visitasPendientes = 23
  const jornadasTotales = 89
  const reportesGenerados = 34

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-8 max-w-7xl mx-auto rounded-lg shadow-lg">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-green-800">Panel Administrativo</h1>
          <p className="text-green-600 mt-1">Gestión completa del sistema PNEF Forestal</p>
        </div>
        <button 
          onClick={() => router.push('/admin/propietarios/agregar')}
          className="bg-green-600 text-white rounded px-6 py-3 hover:bg-green-700 transition"
        >
          + Nuevo Propietario
        </button>
      </header>

      {/* Estadísticas principales */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow border border-green-100 hover:shadow-xl transition">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Total Propietarios</h3>
          <p className="text-3xl font-bold text-green-700">{totalPropietarios}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-yellow-100 hover:shadow-xl transition">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Visitas Pendientes</h3>
          <p className="text-3xl font-bold text-yellow-600">{visitasPendientes}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-blue-100 hover:shadow-xl transition">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Jornadas Totales</h3>
          <p className="text-3xl font-bold text-blue-600">{jornadasTotales}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-purple-100 hover:shadow-xl transition">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Reportes Generados</h3>
          <p className="text-3xl font-bold text-purple-600">{reportesGenerados}</p>
        </div>
      </section>

      {/* Sección de acciones rápidas */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button
          onClick={() => router.push('/admin/usuarios')}
          className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition font-semibold"
        >
          Gestión de Usuarios
        </button>

        <button
          onClick={() => router.push('/admin/visitas')}
          className="bg-yellow-500 text-white p-6 rounded-lg hover:bg-yellow-600 transition font-semibold"
        >
          Manejo Visitas
        </button>

        <button
          onClick={() => router.push('/admin/reportes')}
          className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Generar Reportes
        </button>

        <button
          onClick={() => router.push('/admin/settings')}
          className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition font-semibold"
        >
          Configuración
        </button>
      </section>
    </div>
  )
}