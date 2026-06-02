'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const actividadesOpciones = [
  { value: 'supresion_de_especies_exoticas', label: 'Supresión de Especies Exóticas' },
  { value: 'corta_liberacion', label: 'Corta de Liberación' },
  { value: 'raleo', label: 'Raleo' },
  { value: 'corta_sanitaria', label: 'Corta Sanitaria' },
  { value: 'renovacion_de_bosques', label: 'Renovación de Bosques' },
  { value: 'podas', label: 'Podas' },
  { value: 'corte_de_maderables_no_maderables', label: 'Corte de Maderables y No Maderables' },
  { value: 'medidas_control_erosion', label: 'Medidas de Control de Erosión' },
  { value: 'aplicacion_de_plaguicidas', label: 'Aplicación de Plaguicidas' },
  { value: 'abonos', label: 'Abonos' },
  { value: 'deforestacion', label: 'Deforestación' },
  { value: 'siembra_y_resiembra', label: 'Siembra y Resiembra' },
  { value: 'cortas_mayores', label: 'Cortas Mayores' },
  { value: 'actividades_otros', label: 'Otras' },
]

export default function JornadaMarcacionForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const [propietarios, setPropietarios] = useState([])
  const [form, setForm] = useState({
    propietario_id: '',
    rut: '',
    comunidad_indigena: false,
    comunidad_nombre: '',
    tipo_propietario: '',
    nombre_predio: '',
    rol: '',
    nro_resolucion: '',
    fecha_resolucion: '',
    fecha_jornada: new Date().toISOString().split('T')[0],
    punto_referencia_huso: '',
    punto_referencia_este: '',
    punto_referencia_norte: '',
    superficie_total_predio: '',
    superficie_bajo_regimen: '',
    superficie_manejada: '',
    superficie_bosque_nativo: '',
    superficie_anual_planificada: '',
    superficie_marcada: '',
    superficie_marcada_km: '',
    actividades: [],
    actividad_otro: '',
    observaciones: '',
    prescripciones: '',
    medidas_proteccion: '',
    materiales_utilizados: '',
    firma_supervisor: '',
    firma_propietario: ''
  })

  useEffect(() => {
    async function fetchPropietarios() {
      try {
        const res = await fetch('/api/extPropietarios')
        if (!res.ok) throw new Error('Error cargando propietarios.')
        const data = await res.json()
        setPropietarios(data)
      } catch (error) {
        alert(error.message)
      }
    }
    fetchPropietarios()
  }, [])

  function handlePropietarioChange(e) {
    const id = e.target.value
    const prop = propietarios.find(p => p.id.toString() === id)
    if (prop) {
      setForm(prev => ({
        ...prev,
        propietario_id: id,
        rut: prop.rut,
        comunidad_indigena: prop.comunidad_indigena,
        comunidad_nombre: prop.comunidad_nombre || '',
        tipo_propietario: prop.tipo_propietario || ''
      }))
    } else {
      setForm(prev => ({
        ...prev,
        propietario_id: '',
        rut: '',
        comunidad_indigena: false,
        comunidad_nombre: '',
        tipo_propietario: ''
      }))
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  function handleActividadChange(e) {
    const { value, checked } = e.target
    setForm(prev => ({
      ...prev,
      actividades: checked
        ? [...prev.actividades, value]
        : prev.actividades.filter(a => a !== value)
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.propietario_id) {
      alert('Debe seleccionar un propietario válido.')
      return
    }
    if (!form.fecha_jornada) {
      alert('Debe seleccionar la fecha de la jornada.')
      return
    }
    if (form.actividades.length === 0) {
      alert('Debe seleccionar al menos una actividad.')
      return
    }

    const actividadesFinal = form.actividades.includes('actividades_otros')
      ? [
          ...form.actividades.filter(a => a !== 'actividades_otros'),
          form.actividad_otro
        ].filter(Boolean)
      : form.actividades

    const payload = {
      propietario_id: form.propietario_id,
      nombre_predio: form.nombre_predio,
      rol: form.rol,
      nro_resolucion: form.nro_resolucion,
      fecha_resolucion: form.fecha_resolucion,
      fecha_jornada: form.fecha_jornada,
      punto_referencia_huso: form.punto_referencia_huso,
      punto_referencia_este: form.punto_referencia_este,
      punto_referencia_norte: form.punto_referencia_norte,
      superficie_total_predio: form.superficie_total_predio,
      superficie_bajo_regimen: form.superficie_bajo_regimen,
      superficie_manejada: form.superficie_manejada,
      superficie_bosque_nativo: form.superficie_bosque_nativo,
      superficie_anual_planificada: form.superficie_anual_planificada,
      superficie_marcada: form.superficie_marcada,
      superficie_marcada_km: form.superficie_marcada_km,
      observaciones: form.observaciones,
      prescripciones: form.prescripciones,
      medidas_proteccion: form.medidas_proteccion,
      materiales_utilizados: form.materiales_utilizados,
      firma_supervisor: form.firma_supervisor,
      firma_propietario: form.firma_propietario,
      actividades: actividadesFinal
    }

    try {
      const res = await fetch('/api/jornada_marcacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error desconocido')
      }

      alert('Jornada registrada con éxito')
    } catch (error) {
      alert('Error al enviar los datos: ' + error.message)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow">

      {/* ← ÚNICO CAMBIO: botón volver */}
      <button
        onClick={() => router.push('/extensionista')}
        className="flex items-center gap-2 text-green-700 hover:text-green-900 font-medium text-sm transition mb-4"
      >
        ← Volver al Dashboard
      </button>

      <h1 className="text-3xl font-bold mb-6 text-center">Registrar Jornada de Marcación</h1>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Propietario */}
        <div>
          <label className="block font-semibold mb-2">Propietario</label>
          <select
            value={form.propietario_id}
            onChange={handlePropietarioChange}
            required
            className="border p-3 rounded w-full"
          >
            <option value="">Seleccione un propietario</option>
            {propietarios.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} - {p.rut}</option>
            ))}
          </select>
          <p className="text-sm mt-1">RUT: {form.rut}</p>
          <p className="text-sm">Comunidad indígena: {form.comunidad_nombre}</p>
          <p className="text-sm">Tipo: {form.tipo_propietario}</p>
        </div>

        {/* Datos básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="fecha_jornada"
            type="date"
            value={form.fecha_jornada}
            onChange={handleChange}
            className="border p-3 rounded w-full"
            required
          />
          <input
            name="nro_resolucion"
            placeholder="N° de Resolución Plan Manejo"
            value={form.nro_resolucion}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
          <input
            name="fecha_resolucion"
            type="date"
            value={form.fecha_resolucion}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
          <input
            name="nombre_predio"
            placeholder="Nombre del Predio"
            value={form.nombre_predio}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
          <input
            name="rol"
            placeholder="ROL"
            value={form.rol}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
          <input
            name="punto_referencia_huso"
            placeholder="Punto Referencia HUSO"
            value={form.punto_referencia_huso}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
          <input
            name="punto_referencia_este"
            type="number"
            step="0.01"
            placeholder="Punto Referencia ESTE (m)"
            value={form.punto_referencia_este}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
          <input
            name="punto_referencia_norte"
            type="number"
            step="0.01"
            placeholder="Punto Referencia NORTE (m)"
            value={form.punto_referencia_norte}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
        </div>

        {/* Superficies */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input
            name="superficie_total_predio"
            type="number"
            step="0.01"
            placeholder="Superficie total (Ha)"
            value={form.superficie_total_predio}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
          <input
            name="superficie_bajo_regimen"
            type="number"
            step="0.01"
            placeholder="Superficie bajo régimen (Ha)"
            value={form.superficie_bajo_regimen}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
          <input
            name="superficie_manejada"
            type="number"
            step="0.01"
            placeholder="Superficie manejada (Ha)"
            value={form.superficie_manejada}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
          <input
            name="superficie_bosque_nativo"
            type="number"
            step="0.01"
            placeholder="Superficie bosque nativo (Ha)"
            value={form.superficie_bosque_nativo}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
          <input
            name="superficie_anual_planificada"
            type="number"
            step="0.01"
            placeholder="Superficie anual planificada (Ha)"
            value={form.superficie_anual_planificada}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
          <input
            name="superficie_marcada"
            type="number"
            step="0.01"
            placeholder="Superficie marcada (Ha)"
            value={form.superficie_marcada}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
          <input
            name="superficie_marcada_km"
            type="number"
            step="0.01"
            placeholder="Superficie marcada (Km)"
            value={form.superficie_marcada_km}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
        </div>

        {/* Actividades con checkboxes */}
        <fieldset className="border p-4 rounded">
          <legend className="font-semibold mb-3">Actividades Realizadas</legend>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {actividadesOpciones.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={value}
                  checked={form.actividades.includes(value)}
                  onChange={handleActividadChange}
                  className="w-4 h-4 accent-green-600"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
          {form.actividades.includes('actividades_otros') && (
            <input
              type="text"
              name="actividad_otro"
              value={form.actividad_otro}
              onChange={handleChange}
              placeholder="Especifique otra actividad"
              className="border p-3 rounded w-full mt-3"
            />
          )}
        </fieldset>

        {/* Textos */}
        <textarea
          name="observaciones"
          placeholder="Observaciones"
          value={form.observaciones}
          onChange={handleChange}
          className="w-full h-24 border p-3 rounded"
        />
        <textarea
          name="prescripciones"
          placeholder="Prescripciones técnicas"
          value={form.prescripciones}
          onChange={handleChange}
          className="w-full h-24 border p-3 rounded"
        />
        <textarea
          name="medidas_proteccion"
          placeholder="Medidas de protección"
          value={form.medidas_proteccion}
          onChange={handleChange}
          className="w-full h-24 border p-3 rounded"
        />
        <textarea
          name="materiales_utilizados"
          placeholder="Materiales utilizados (separados por comas)"
          value={form.materiales_utilizados}
          onChange={handleChange}
          className="w-full h-20 border p-3 rounded"
        />

        {/* Firmas */}
        <input
          name="firma_supervisor"
          placeholder="Firma Supervisor"
          value={form.firma_supervisor}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />
        <input
          name="firma_propietario"
          placeholder="Firma Propietario"
          value={form.firma_propietario}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />

        <button
          type="submit"
          className="bg-green-600 text-white py-3 px-6 rounded hover:bg-green-700 transition w-full"
        >
          Enviar Jornada
        </button>
      </form>
    </div>
  )
}