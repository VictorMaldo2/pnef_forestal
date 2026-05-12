'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AgendarVisitaPage() {
  const [propietarios, setPropietarios] = useState([])
  const [propietarioSelecionado, setPropietarioSelecionado] = useState('')
  const [fechaVisita, setFechaVisita] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Cargar propietarios desde tu API
  useEffect(() => {
    async function fetchPropietarios() {
      try {
        setLoading(true)
        const res = await fetch('/api/extPropietarios')
        if (!res.ok) throw new Error('Error al cargar propietarios')
        const data = await res.json()
        setPropietarios(data)
      } catch (err) {
        setError('Error al cargar propietarios: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPropietarios()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!propietarioSelecionado || !fechaVisita) {
      setError('Debe seleccionar propietario y fecha')
      return
    }

    try {
      const res = await fetch('/api/extVisitas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propietario_id: parseInt(propietarioSelecionado),
          fecha_visita: fechaVisita,
          descripcion: descripcion || null,
          estado: 'pendiente',
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al agendar visita')
      }

      setSuccess('Visita agendada con éxito')
      setPropietarioSelecionado('')
      setFechaVisita('')
      setDescripcion('')
      router.refresh() // Recarga datos si es necesario
    } catch (err) {
      setError('Error al agendar visita: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-green-700 font-medium">Cargando propietarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 bg-clip-text text-transparent mb-4">
            Agendar Visita
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl max-w-md mx-auto">
            Programa tu próxima visita de campo
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-green-100 p-8 sm:p-10 lg:p-12">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm font-medium shadow-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-sm font-medium shadow-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Propietario */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Selecciona Propietario
              </label>
              <select
                value={propietarioSelecionado}
                onChange={e => setPropietarioSelecionado(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/30 focus:border-green-500 bg-white/50 backdrop-blur-sm text-sm sm:text-base shadow-inner transition-all duration-300 hover:border-green-300"
                required
              >
                <option value="">Seleccione un propietario</option>
                {propietarios.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} - {p.rut}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Fecha de Visita
              </label>
              <input
                type="date"
                value={fechaVisita}
                onChange={e => setFechaVisita(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/30 focus:border-green-500 bg-white/50 backdrop-blur-sm text-sm sm:text-base shadow-inner transition-all duration-300 hover:border-green-300"
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-2-4H9M7 7h10" />
                </svg>
                Descripción (Opcional)
              </label>
              <textarea
                rows="4"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/30 focus:border-green-500 bg-white/50 backdrop-blur-sm text-sm sm:text-base shadow-inner resize-vertical transition-all duration-300 hover:border-green-300"
                placeholder="Descripción o notas adicionales de la visita..."
              />
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                className="group relative overflow-hidden flex-1 bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-500 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-green-500/50"
              >
                <div className="absolute inset-0 bg-white/20 skew-x-12 -rotate-3 group-hover:rotate-0 transition-transform duration-700 -z-10"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  📅 Agendar Visita
                </span>
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 transform hover:scale-[1.02]"
              >
                ← Volver
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}