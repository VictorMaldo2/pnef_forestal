'use client'

import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ArrowLeftIcon, PlusIcon, UsersIcon, CalendarIcon, DocumentTextIcon, CogIcon } from '@heroicons/react/24/outline'

export default function AdminDashboard() {
  const router = useRouter()

  // Datos simulados para mostrar estadísticas
  const totalPropietarios = 156
  const visitasPendientes = 23
  const jornadasTotales = 89
  const reportesGenerados = 34

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-25 to-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 pb-8 border-b border-green-100">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.back()}
                className="p-2 bg-white/50 hover:bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 lg:hidden"
              >
                <ArrowLeftIcon className="h-5 w-5 text-green-700" />
              </button>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-green-800 via-green-700 to-green-600 bg-clip-text text-transparent leading-tight">
                Panel Administrativo
              </h1>
            </div>
            <p className="text-green-600 text-sm sm:text-base lg:text-lg max-w-2xl">
              Gestión completa del sistema PNEF 
            </p>
          </div>
          
          <button 
            onClick={() => router.push('/admin/propietarios/agregar')}
            className="w-full lg:w-auto flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            <PlusIcon className="h-5 w-5" />
            Nuevo Propietario
          </button>

          <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition font-semibold shadow-md self-start lg:self-auto"
                      aria-label="Cerrar sesión"
                    >
                      Cerrar sesión
                    </button>
        </div>

        {/* Estadísticas principales */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
  <button
    type="button"
    className="group bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-lg border border-green-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-green-200"
    onClick={() => router.push('/admin/propietarios/MosPro')} // Cambia por ruta deseada
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
        <UsersIcon className="h-6 w-6 text-green-600" />
      </div>
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
    <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 text-gray-800 leading-tight">
      Total Propietarios
    </h3>
    <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-green-700 drop-shadow-sm">
      {totalPropietarios.toLocaleString()}
    </p>
  </button>

  <button
    type="button"
    className="group bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-lg border border-yellow-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-yellow-200"
    onClick={() => router.push('/admin/visitas/visPen')} // Cambia por ruta deseada
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
        <CalendarIcon className="h-6 w-6 text-yellow-600" />
      </div>
      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
    <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 text-gray-800 leading-tight">
      Visitas Pendientes
    </h3>
    <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-yellow-600 drop-shadow-sm">
      {visitasPendientes}
    </p>
  </button>

  <button
    type="button"
    className="group bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-lg border border-blue-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-blue-200"
    onClick={() => router.push('/ruta-jornadas')} // Cambia por ruta deseada
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
        <CalendarIcon className="h-6 w-6 text-blue-600" />
      </div>
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
    <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 text-gray-800 leading-tight">
      Jornadas Totales
    </h3>
    <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-600 drop-shadow-sm">
      {jornadasTotales}
    </p>
  </button>

  <button
    type="button"
    className="group bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-lg border border-purple-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-purple-200"
    onClick={() => router.push('/ruta-reportes')} // Cambia por ruta deseada
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
        <DocumentTextIcon className="h-6 w-6 text-purple-600" />
      </div>
      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
    <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 text-gray-800 leading-tight">
      Reportes Generados
    </h3>
    <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-purple-600 drop-shadow-sm">
      {reportesGenerados}
    </p>
  </button>
</section>

        {/* Sección de acciones rápidas */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 pt-8 border-t border-green-100">
          <button
            onClick={() => router.push('/admin/usuarios')}
            className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-green-700 text-white p-8 rounded-3xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transform"
          >
            <div className="absolute inset-0 bg-white/20 rotate-12 group-hover:rotate-0 transition-transform duration-700 -z-10"></div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <UsersIcon className="h-7 w-7" />
              </div>
              <span className="text-sm sm:text-base lg:text-lg font-bold tracking-wide">Gestión de Usuarios</span>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/visitas')}
            className="group relative overflow-hidden bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-8 rounded-3xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transform"
          >
            <div className="absolute inset-0 bg-white/20 rotate-12 group-hover:rotate-0 transition-transform duration-700 -z-10"></div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CalendarIcon className="h-7 w-7" />
              </div>
              <span className="text-sm sm:text-base lg:text-lg font-bold tracking-wide">Manejo Visitas</span>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/reportes')}
            className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 rounded-3xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transform"
          >
            <div className="absolute inset-0 bg-white/20 rotate-12 group-hover:rotate-0 transition-transform duration-700 -z-10"></div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <DocumentTextIcon className="h-7 w-7" />
              </div>
              <span className="text-sm sm:text-base lg:text-lg font-bold tracking-wide">Generar Reportes</span>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/settings')}
            className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-purple-700 text-white p-8 rounded-3xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transform"
          >
            <div className="absolute inset-0 bg-white/20 rotate-12 group-hover:rotate-0 transition-transform duration-700 -z-10"></div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CogIcon className="h-7 w-7 animate-spin-slow" />
              </div>
              <span className="text-sm sm:text-base lg:text-lg font-bold tracking-wide">Configuración</span>
            </div>
          </button>
        </section>
      </div>
    </div>
  )
}