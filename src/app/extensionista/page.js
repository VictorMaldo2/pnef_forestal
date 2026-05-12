'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, UsersIcon, ClockIcon, CheckCircleIcon, CalendarIcon, PlusIcon, MapPinIcon, DocumentIcon, WrenchIcon } from '@heroicons/react/24/outline'

export default function ExtensionistaDashboard() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-25 to-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-10 pb-8 border-b border-green-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2.5 bg-white/60 hover:bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 lg:hidden backdrop-blur-sm border border-green-100"
            >
              <ArrowLeftIcon className="h-5 w-5 text-green-700" />
            </button>
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black bg-gradient-to-r from-green-800 via-green-700 to-green-600 bg-clip-text text-transparent leading-tight">
                Dashboard Extensionista
              </h2>
              <p className="text-green-600 text-sm sm:text-base lg:text-lg mt-1">Gestión diaria de campo PNEF Forestal</p>
            </div>
          </div>
        </div>

        {/* Estadísticas principales */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {/* Propietarios */}
          <div
            className="group bg-white/70 backdrop-blur-sm p-6 sm:p-8 lg:p-10 rounded-3xl shadow-xl border border-green-100 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer hover:border-green-200"
            onClick={() => router.push('/extensionista/propietarios')}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="p-3.5 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                <UsersIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-4 text-gray-800 leading-tight">Propietarios</h3>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-green-700 drop-shadow-lg">23</p>
          </div>
          
          {/* Visitas Pendientes */}
          <div 
            className="group bg-white/70 backdrop-blur-sm p-6 sm:p-8 lg:p-10 rounded-3xl shadow-xl border border-yellow-100 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer hover:border-yellow-200"
            onClick={() => router.push('/extensionista/visi_pen')}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="p-3.5 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-4 text-gray-800 leading-tight">Visitas Pendientes</h3>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-yellow-600 drop-shadow-lg">5</p>
          </div>
          
          {/* Jornadas Completadas */}
          <div className="group bg-white/70 backdrop-blur-sm p-6 sm:p-8 lg:p-10 rounded-3xl shadow-xl border border-blue-100 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 hover:border-blue-200">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                <CheckCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-4 text-gray-800 leading-tight">Jornadas Completadas</h3>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-600 drop-shadow-lg">12</p>
          </div>
        </section>

        {/* Sección inferior */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Próximas Visitas */}
          <div className="lg:col-span-1 bg-white/70 backdrop-blur-sm p-6 sm:p-8 lg:p-10 rounded-3xl shadow-xl border border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-sm">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-800">Próximas Visitas</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-green-200 hover:bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPinIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-900 text-sm sm:text-base truncate">Juan Pérez</span>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs sm:text-sm font-semibold">15 Jun</span>
              </div>
              <div className="flex justify-between items-center p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-green-200 hover:bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPinIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-900 text-sm sm:text-base truncate">María González</span>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs sm:text-sm font-semibold">20 Jun</span>
              </div>
            </div>
          </div>
          
          {/* Acciones Rápidas */}
          <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm p-6 sm:p-8 lg:p-10 rounded-3xl shadow-xl border border-green-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl shadow-sm">
                <PlusIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-800">Acciones Rápidas</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={() => router.push('/extensionista/visitas')}
                className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700 text-white p-8 rounded-3xl hover:from-green-700 hover:to-emerald-800 transition-all duration-500 font-semibold shadow-2xl hover:shadow-3xl hover:-translate-y-2 hover:scale-[1.02] transform"
              >
                <div className="absolute inset-0 bg-white/30 skew-x-12 -rotate-3 group-hover:rotate-0 transition-transform duration-700 -z-10"></div>
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <CalendarIcon className="h-7 w-7" />
                  </div>
                  <span className="text-sm sm:text-base lg:text-lg font-bold tracking-wide text-center leading-tight">Agendar Visita</span>
                </div>
              </button>

              <button
                onClick={() => router.push('/extensionista/jornadas')}
                className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 rounded-3xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-500 font-semibold shadow-2xl hover:shadow-3xl hover:-translate-y-2 hover:scale-[1.02] transform"
              >
                <div className="absolute inset-0 bg-white/30 skew-x-12 -rotate-3 group-hover:rotate-0 transition-transform duration-700 -z-10"></div>
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <CheckCircleIcon className="h-7 w-7" />
                  </div>
                  <span className="text-sm sm:text-base lg:text-lg font-bold tracking-wide text-center leading-tight">Jornada de Marcación</span>
                </div>
              </button>

              <button
                onClick={() => router.push('/extensionista/talonario')}
                className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-violet-700 text-white p-8 rounded-3xl hover:from-purple-700 hover:to-violet-800 transition-all duration-500 font-semibold shadow-2xl hover:shadow-3xl hover:-translate-y-2 hover:scale-[1.02] transform"
              >
                <div className="absolute inset-0 bg-white/30 skew-x-12 -rotate-3 group-hover:rotate-0 transition-transform duration-700 -z-10"></div>
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <DocumentIcon className="h-7 w-7" />
                  </div>
                  <span className="text-sm sm:text-base lg:text-lg font-bold tracking-wide text-center leading-tight">Talonario de Terreno</span>
                </div>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}