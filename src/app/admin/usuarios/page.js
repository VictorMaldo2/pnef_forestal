'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, UserIcon, EnvelopeIcon, IdentificationIcon } from '@heroicons/react/24/outline'

export default function AdminUsuarios() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const res = await fetch('/api/usuarios')
        if (!res.ok) throw new Error('Error al obtener usuarios')
        const data = await res.json()
        setUsuarios(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchUsuarios()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold shadow-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 pb-6 border-b border-green-100">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent leading-tight">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base max-w-md">
              Administra todos los usuarios del sistema
            </p>
          </div>
          
          <button
            onClick={() => router.back()}
            className="w-full lg:w-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Volver
          </button>
        </div>

        {/* Tabla de Usuarios */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-green-100 overflow-hidden">
          <div className="px-6 py-8 sm:px-8 lg:px-10 border-b border-green-50 bg-gradient-to-r from-green-50 to-green-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <UserIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  Lista de Usuarios ({usuarios.length})
                </h2>
                <p className="text-green-600 text-sm sm:text-base">Total de usuarios registrados</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-green-50">
              <thead className="bg-gradient-to-r from-green-600/10 to-green-700/10 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-5 lg:px-8 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <IdentificationIcon className="h-4 w-4" />
                      ID
                    </div>
                  </th>
                  <th className="px-6 py-5 lg:px-8 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4" />
                      Email
                    </div>
                  </th>
                  <th className="px-6 py-5 lg:px-8 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Nombre
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-16 px-4">
                      <div className="flex flex-col items-center">
                        <UserIcon className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-500 mb-2">No hay usuarios</h3>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto">
                          No se han registrado usuarios aún en el sistema
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  usuarios.map((user) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-green-50/50 transition-all duration-200 group"
                    >
                      <td className="px-6 py-6 lg:px-8 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          #{user.id}
                        </span>
                      </td>
                      <td className="px-6 py-6 lg:px-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <EnvelopeIcon className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 lg:px-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <UserIcon className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.nombre}</p>
                          </div>
                        </div>
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