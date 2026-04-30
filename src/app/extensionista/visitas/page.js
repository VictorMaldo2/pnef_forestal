'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AgendarVisitaPage() {
  const [propietarios, setPropietarios] = useState([])
  const [propietarioSelecionado, setPropietarioSelecionado] = useState('')
  const [fechaVisita, setFechaVisita] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Cargar propietarios desde la base
  useEffect(() => {
    async function fetchPropietarios() {
      const { data, error } = await supabase.from('propietarios').select('id, nombre, rut')
      if (error) {
        setError('Error al cargar propietarios')
      } else {
        setPropietarios(data)
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

    const { error } = await supabase.from('visitas').insert([{
      propietario_id: propietarioSelecionado,
      fecha_visita: fechaVisita,
      descripcion: descripcion,
      estado: 'pendiente',
      creado_en: new Date(),
    }])

    if (error) {
      setError('Error al agendar visita: ' + error.message)
    } else {
      setSuccess('Visita agendada con éxito')
      setPropietarioSelecionado('')
      setFechaVisita('')
      setDescripcion('')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-green-800">Agendar Visita Próxima</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}
      {success && <p className="mb-4 text-green-600">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Propietario</label>
          <select
            value={propietarioSelecionado}
            onChange={e => setPropietarioSelecionado(e.target.value)}
            className="w-full p-2 border rounded"
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

        <div>
          <label className="block mb-1 font-semibold">Fecha de Visita</label>
          <input
            type="date"
            value={fechaVisita}
            onChange={e => setFechaVisita(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Descripción</label>
          <textarea
            rows="4"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Descripción o notas adicionales"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
        >
          Agendar Visita
        </button>
      </form>
    </div>
  )
} 