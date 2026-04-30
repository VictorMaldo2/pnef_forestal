'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AgregarPropietario() {
  const [form, setForm] = useState({
    rut: '',
    nombre: '',
    comunidad_indigena: false,
    comunidad_nombre: '',
    genero: '',
    comuna: '',
    tipo_propietario: '',
    telefono: '',
    email: '',
    direccion: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data, error } = await supabase
        .from('propietarios')
        .insert([form])
        .select()

      if (error) {
        setError('Error al guardar propietario: ' + error.message)
      } else {
        setSuccess('Propietario agregado exitosamente')
        setForm({
          rut: '',
          nombre: '',
          comunidad_indigena: false,
          comunidad_nombre: '',
          genero: '',
          comuna: '',
          tipo_propietario: '',
          telefono: '',
          email: '',
          direccion: ''
        })
      }
    } catch (err) {
      setError('Error inesperado: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">Agregar Propietario</h1>
          <button
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            ← Volver
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                RUT *
              </label>
              <input
                type="text"
                name="rut"
                value={form.rut}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="12345678-9"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Nombre Completo *
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Juan Pérez"
                required
              />
            </div>
          </div>

          {/* Comunidad indígena */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="comunidad_indigena"
              checked={form.comunidad_indigena}
              onChange={handleChange}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
            />
            <label className="text-sm font-semibold text-gray-700">
              Pertenece a comunidad indígena
            </label>
          </div>

          {/* Si pertenece, pide nombre comunidad */}
          {form.comunidad_indigena && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Nombre de la Comunidad
              </label>
              <input
                type="text"
                name="comunidad_nombre"
                value={form.comunidad_nombre}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Mapuche, Aymara, etc."
              />
            </div>
          )}

          {/* Más campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Género
              </label>
              <select
                name="genero"
                value={form.genero}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Seleccionar género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Comuna
              </label>
              <input
                type="text"
                name="comuna"
                value={form.comuna}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Temuco, Calama, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Tipo de Propietario
              </label>
              <select
                name="tipo_propietario"
                value={form.tipo_propietario}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Seleccionar tipo</option>
                <option value="Pequeño">Pequeño</option>
                <option value="Mediano">Mediano</option>
                <option value="Grande">Grande</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="+56912345678"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Dirección
            </label>
            <textarea
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Dirección completa"
              rows={3}
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? 'Guardando...' : 'Guardar Propietario'}
          </button>
        </form>
      </div>
    </div>
  )
}