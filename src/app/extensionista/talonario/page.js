'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TalonarioForm() {
  const [form, setForm] = useState({
    tipo_recurso: 'Bosque Nativo',
    fecha: '',
    propietario_id: '',
    rut_persona_presente: '',
    nombre_persona_presente: '',
    rol_persona_presente: '',
    actividades_realizadas: {
      recorrido_predial: false,
      forestacion: false,
      evaluacion_ejecucion: false,
      plan_manejo: false,
      otro: ''
    },
    supervisor: '',
    observaciones: '',
    recomendaciones: '',
    medidas_prevencion: '',
    productos_predio: {
      carbon_sacos: '',
      lena_m3: '',
      madera_pulgadas: false,
      visitantes: '',
      otros: ''
    },
    firma_extensionista: '',
    firma_persona_predio: ''
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(e) {
    const { name, value, type, checked } = e.target

    if (name in form.actividades_realizadas) {
      setForm({
        ...form,
        actividades_realizadas: {
          ...form.actividades_realizadas,
          [name]: type === 'checkbox' ? checked : value
        }
      })
    } else if (name in form.productos_predio) {
      setForm({
        ...form,
        productos_predio: {
          ...form.productos_predio,
          [name]: type === 'checkbox' ? checked : value
        }
      })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      // Insertar en supabase
      const { error } = await supabase.from('talonarios').insert({
        tipo_recurso: form.tipo_recurso,
        fecha: form.fecha,
        propietario_id: form.propietario_id,
        rut_persona_presente: form.rut_persona_presente,
        nombre_persona_presente: form.nombre_persona_presente,
        rol_persona_presente: form.rol_persona_presente,
        actividades_realizadas: form.actividades_realizadas,
        supervisor: form.supervisor,
        observaciones: form.observaciones,
        recomendaciones: form.recomendaciones,
        medidas_prevencion: form.medidas_prevencion,
        productos_predio: form.productos_predio,
        firma_extensionista: form.firma_extensionista,
        firma_persona_predio: form.firma_persona_predio
      })

      if (error) {
        setError('Error al guardar el talonario: ' + error.message)
        return
      }

      setSuccess('Talonario guardado exitosamente')
      // Limpiar formulario o navegar, según prefieras
    } catch (err) {
      setError('Error inesperado: ' + err.message)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Formulario Talonario de Terreno</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de recurso */}
        <label className="block">
          <span className="font-semibold">Tipo de Recurso</span>
          <select name="tipo_recurso" value={form.tipo_recurso} onChange={handleChange} className="w-full p-2 border rounded mt-1">
            <option>Bosque Nativo</option>
            <option>Plantaciones</option>
          </select>
        </label>

        {/* Fecha */}
        <label className="block">
          <span className="font-semibold">Fecha</span>
          <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className="w-full p-2 border rounded mt-1" required />
        </label>

        {/* Propietario (debería ser select conectado a base de datos) */}
        <label className="block">
          <span className="font-semibold">Propietario ID</span>
          <input
            type="text"
            name="propietario_id"
            placeholder="ID propietario"
            value={form.propietario_id}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
            required
          />
        </label>

        {/* Persona presente */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <span className="font-semibold">Rut Persona Presente</span>
            <input type="text" name="rut_persona_presente" value={form.rut_persona_presente} onChange={handleChange} className="w-full p-2 border rounded mt-1" required />
          </label>
          <label className="block">
            <span className="font-semibold">Nombre Persona Presente</span>
            <input type="text" name="nombre_persona_presente" value={form.nombre_persona_presente} onChange={handleChange} className="w-full p-2 border rounded mt-1" required />
          </label>
          <label className="block">
            <span className="font-semibold">Rol Persona Presente</span>
            <input type="text" name="rol_persona_presente" value={form.rol_persona_presente} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
          </label>
        </div>

        {/* Actividades realizadas (checkboxes) */}
        <fieldset className="border p-4 rounded space-y-2">
          <legend className="font-semibold mb-2">Actividades Realizadas</legend>
          <label>
            <input type="checkbox" name="recorrido_predial" checked={form.actividades_realizadas.recorrido_predial || false} onChange={handleChange} className="mr-2" />
            Recorrido Predial
          </label>
          <label>
            <input type="checkbox" name="forestacion" checked={form.actividades_realizadas.forestacion || false} onChange={handleChange} className="mr-2" />
            Forestación
          </label>
          <label>
            <input type="checkbox" name="evaluacion_ejecucion" checked={form.actividades_realizadas.evaluacion_ejecucion || false} onChange={handleChange} className="mr-2" />
            Evaluación de Ejecución
          </label>
          <label>
            <input type="checkbox" name="plan_manejo" checked={form.actividades_realizadas.plan_manejo || false} onChange={handleChange} className="mr-2" />
            Plan de Manejo
          </label>
          <label>
            Otra Actividad:
            <input type="text" name="otro" value={form.actividades_realizadas.otro || ''} onChange={handleChange} className="ml-2 border p-1 rounded" />
          </label>
        </fieldset>

        {/* Supervisor */}
        <label className="block">
          <span className="font-semibold">Supervisor</span>
          <input type="text" name="supervisor" value={form.supervisor} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
        </label>

        {/* Observaciones, recomendaciones y medidas */}
        <label className="block">
          <span className="font-semibold">Observaciones</span>
          <textarea name="observaciones" value={form.observaciones} onChange={handleChange} className="w-full p-2 border rounded mt-1" rows="3" />
        </label>

        <label className="block">
          <span className="font-semibold">Recomendaciones</span>
          <textarea name="recomendaciones" value={form.recomendaciones} onChange={handleChange} className="w-full p-2 border rounded mt-1" rows="3" />
        </label>

        <label className="block">
          <span className="font-semibold">Medidas de prevención y control</span>
          <textarea name="medidas_prevencion" value={form.medidas_prevencion} onChange={handleChange} className="w-full p-2 border rounded mt-1" rows="3" />
        </label>

        {/* Productos del predio */}
        <fieldset className="border p-4 rounded space-y-2">
          <legend className="font-semibold mb-2">Productos del Predio</legend>
          <label>
            Cantidad de Sacos de Carbón:
            <input type="number" name="carbon_sacos" value={form.productos_predio.carbon_sacos || ''} onChange={handleChange} className="ml-2 border p-1 rounded w-20" min="0" />
          </label>
          <label>
            Cantidad de m3 de Leña:
            <input type="number" name="lena_m3" value={form.productos_predio.lena_m3 || ''} onChange={handleChange} className="ml-2 border p-1 rounded w-20" min="0" />
          </label>
          <label>
            Madera en pulgadas (Sí/No):
            <input type="checkbox" name="madera_pulgadas" checked={form.productos_predio.madera_pulgadas || false} onChange={handleChange} className="ml-2" />
          </label>
          <label>
            Número de visitantes:
            <input type="number" name="visitantes" value={form.productos_predio.visitantes || ''} onChange={handleChange} className="ml-2 border p-1 rounded w-20" min="0" />
          </label>
          <label>
            Otros productos:
            <input type="text" name="otros" value={form.productos_predio.otros || ''} onChange={handleChange} className="ml-2 border p-1 rounded w-full" />
          </label>
        </fieldset>

        {/* Firmas */}
        <label className="block">
          <span className="font-semibold">Firma Extensionista (URL o texto)</span>
          <input type="text" name="firma_extensionista" value={form.firma_extensionista} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
        </label>

        <label className="block">
          <span className="font-semibold">Firma Persona Predio (URL o texto)</span>
          <input type="text" name="firma_persona_predio" value={form.firma_persona_predio} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
        </label>

        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded mt-4">
          Guardar Talonario
        </button>
      </form>
    </div>
  )
}