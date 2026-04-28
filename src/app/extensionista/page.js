'use client'

import { useRouter } from 'next/navigation'

export default function ExtensionistaDashboard() {
  const router = useRouter()

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-8 text-green-800">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Propietarios */}
        <div
          className="bg-white p-8 rounded-xl shadow-lg border border-green-100 hover:shadow-xl cursor-pointer transition-all duration-300"
          onClick={() => router.push('/extensionista/propietarios')}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Propietarios</h3>
          <p className="text-3xl font-bold text-green-600">23</p>
        </div>
        
        {/* Visitas Pendientes */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-yellow-100 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Visitas Pendientes</h3>
          <p className="text-3xl font-bold text-yellow-600">5</p>
        </div>
        
        {/* Jornadas Completadas */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Jornadas Completadas</h3>
          <p className="text-3xl font-bold text-blue-600">12</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Próximas Visitas */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-green-100">
          <h3 className="text-xl font-semibold mb-4 text-green-800">Próximas Visitas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span>Juan Pérez</span>
              <span className="text-sm text-yellow-600 font-medium">15 Jun</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span>María González</span>
              <span className="text-sm text-yellow-600 font-medium">20 Jun</span>
            </div>
          </div>
        </div>
        
        {/* Acciones Rápidas, Jornadas y Talonarios */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-green-100 lg:col-span-2">
          <h3 className="text-xl font-semibold mb-6 text-green-800">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => router.push('/extensionista/visitas')}
              className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition-all duration-200"
            >
              + Agendar Visita
            </button>
            <button
              onClick={() => router.push('/extensionista/jornadas')}
              className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-all duration-200"
            >
              Jornada de Marcación
            </button>
            <button
              onClick={() => router.push('/extensionista/talonario')}
              className="bg-purple-600 text-white p-6 rounded-xl hover:bg-purple-700 transition-all duration-200"
            >
              Talonario de Terreno
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}