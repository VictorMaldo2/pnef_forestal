'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import SelectorPredio from '../../components/SelectorPredio'

function BuscadorPropietario({ propietarios, value, onChange }) {
  const [busqueda, setBusqueda] = useState('')
  const [abierto, setAbierto]   = useState(false)
  const ref                     = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtrados = propietarios.filter(p =>
    `${p.nombre} ${p.rut}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  const seleccionado = propietarios.find(p => p.id.toString() === value)

  function seleccionar(p) {
    onChange(p)
    setBusqueda('')
    setAbierto(false)
  }

  function limpiar() {
    onChange(null)
    setBusqueda('')
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center border-2 border-gray-200 rounded-2xl bg-white/50 hover:border-green-300 transition-all duration-300 overflow-hidden focus-within:ring-4 focus-within:ring-green-500/30 focus-within:border-green-500">
        <input
          type="text"
          value={seleccionado && !abierto ? `${seleccionado.nombre} - ${seleccionado.rut}` : busqueda}
          onChange={e => { setBusqueda(e.target.value); setAbierto(true); onChange(null) }}
          onFocus={() => { setAbierto(true); setBusqueda('') }}
          placeholder="Buscar propietario por nombre o RUT..."
          className="flex-1 px-4 py-4 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
        />
        {value && (
          <button type="button" onClick={limpiar}
            className="px-3 text-gray-400 hover:text-gray-600 text-lg">✕</button>
        )}
      </div>
      {abierto && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
          {filtrados.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">No se encontraron propietarios</p>
          ) : (
            filtrados.map(p => (
              <button key={p.id} type="button" onClick={() => seleccionar(p)}
                className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-green-50 hover:text-green-700 transition-colors border-b border-gray-50 last:border-0">
                <span className="font-medium">{p.nombre}</span>
                <span className="text-gray-500 ml-2">{p.rut}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function AgendarVisitaPage() {
  const [propietarios, setPropietarios]                     = useState([])
  const [propietarioSelecionado, setPropietarioSelecionado] = useState(null)
  const [predioId, setPredioId]                             = useState(null)
  const [fechaVisita, setFechaVisita]                       = useState('')
  const [descripcion, setDescripcion]                       = useState('')
  const [actividad, setActividad]                           = useState('')
  const [error, setError]                                   = useState('')
  const [success, setSuccess]                               = useState('')
  const [loading, setLoading]                               = useState(true)
  const router = useRouter()

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

  function handlePropietarioChange(prop) {
    setPropietarioSelecionado(prop)
    setPredioId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!propietarioSelecionado || !fechaVisita || !actividad) {
      setError('Debe seleccionar propietario, fecha y actividad')
      return
    }

    try {
      const res = await fetch('/api/extVisitas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propietario_id: propietarioSelecionado.id,
          predio_id:      predioId,
          fecha_visita:   fechaVisita,
          descripcion:    descripcion || null,
          actividad:      actividad,
          estado:         'pendiente',
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al agendar visita')
      }

      setSuccess('Visita agendada con éxito')
      setPropietarioSelecionado(null)
      setPredioId(null)
      setFechaVisita('')
      setDescripcion('')
      setActividad('')
      router.refresh()
    } catch (err) {
      setError('Error al agendar visita: ' + err.message)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-lg text-green-700 font-medium">Cargando propietarios...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 bg-clip-text text-transparent mb-4">
            Agendar Visita
          </h1>
          <p className="text-gray-700 text-lg sm:text-xl max-w-md mx-auto">
            Programa tu próxima visita de campo
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-green-100 p-8 sm:p-10 lg:p-12">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-sm font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Propietario */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Selecciona Propietario
              </label>
              <BuscadorPropietario
                propietarios={propietarios}
                value={propietarioSelecionado?.id?.toString() || ''}
                onChange={handlePropietarioChange}
              />
            </div>

            {/* Selector de predio */}
            {propietarioSelecionado && (
              <SelectorPredio
                propietarioId={propietarioSelecionado.id}
                value={predioId}
                onChange={setPredioId}
              />
            )}

            {/* Fecha */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Fecha de Visita
              </label>
              <input type="date" value={fechaVisita}
                onChange={e => setFechaVisita(e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/30 focus:border-green-500 bg-white/50 text-sm text-gray-800 shadow-inner transition-all duration-300 hover:border-green-300"
                required />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-2-4H9M7 7h10" />
                </svg>
                Descripción (Opcional)
              </label>
              <textarea rows="4" value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/30 focus:border-green-500 bg-white/50 text-sm text-gray-800 placeholder-gray-400 shadow-inner resize-vertical transition-all duration-300 hover:border-green-300"
                placeholder="Descripción o notas adicionales de la visita..." />
            </div>

            {/* Actividad */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
                Actividad Relacionada
              </label>
              <select value={actividad} onChange={e => setActividad(e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/30 focus:border-green-500 bg-white/50 text-sm text-gray-800 shadow-inner transition-all duration-300 hover:border-green-300"
                required>
                <option value="">Seleccione actividad</option>
                <option value="Inspección">Visita jornada marcación</option>
                <option value="Revisión">Visita talonario terreno</option>
                <option value="Mantenimiento">Visita regular</option>
                <option value="Capacitación">Capacitación</option>
              </select>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button type="submit"
                className="group relative overflow-hidden flex-1 bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-2xl hover:-translate-y-1 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-green-500/50">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  📅 Agendar Visita
                </span>
              </button>
              <button type="button" onClick={() => router.back()}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-1 transition-all duration-300">
                ← Volver
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}