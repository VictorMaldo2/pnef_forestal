'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SelectorPredio from '../../components/SelectorPredio'

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

const inputClass = "border p-3 rounded w-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"

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

  function seleccionar(p) { onChange(p); setBusqueda(''); setAbierto(false) }
  function limpiar() { onChange(null); setBusqueda('') }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center border rounded w-full overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
        <input type="text"
          value={seleccionado && !abierto ? `${seleccionado.nombre} - ${seleccionado.rut}` : busqueda}
          onChange={e => { setBusqueda(e.target.value); setAbierto(true); onChange(null) }}
          onFocus={() => { setAbierto(true); setBusqueda('') }}
          placeholder="Buscar propietario por nombre o RUT..."
          className="flex-1 p-3 text-sm text-gray-800 placeholder-gray-400 outline-none" />
        {value && (
          <button type="button" onClick={limpiar}
            className="px-3 text-gray-400 hover:text-gray-600 text-lg">✕</button>
        )}
      </div>
      {abierto && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-xl max-h-60 overflow-y-auto">
          {filtrados.length === 0
            ? <p className="px-4 py-3 text-sm text-gray-500">No se encontraron propietarios</p>
            : filtrados.map(p => (
                <button key={p.id} type="button" onClick={() => seleccionar(p)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-green-50 hover:text-green-700 transition-colors border-b border-gray-50 last:border-0">
                  <span className="font-medium">{p.nombre}</span>
                  <span className="text-gray-500 ml-2">{p.rut}</span>
                </button>
              ))
          }
        </div>
      )}
    </div>
  )
}

export default function JornadaMarcacionForm() {
  const { data: session } = useSession()
  const router            = useRouter()
  const [propietarios, setPropietarios] = useState([])
  const [predioId, setPredioId]         = useState(null)
  const [notificacion, setNotificacion] = useState(null)
  const [form, setForm] = useState({
    propietario_id: '',
    rut: '',
    comunidad_indigena: false,
    comunidad_nombre: '',
    tipo_propietario: '',
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
  })

  useEffect(() => {
    async function fetchPropietarios() {
      try {
        const res = await fetch('/api/extPropietarios')
        if (!res.ok) throw new Error('Error cargando propietarios.')
        const data = await res.json()
        setPropietarios(data)
      } catch (error) {
        mostrarNotificacion('Error cargando propietarios: ' + error.message, 'error')
      }
    }
    fetchPropietarios()
  }, [])

  function mostrarNotificacion(mensaje, tipo = 'success') {
    setNotificacion({ mensaje, tipo })
    setTimeout(() => setNotificacion(null), tipo === 'success' ? 3000 : 4000)
  }

  function handlePropietarioChange(prop) {
    if (prop) {
      setForm(prev => ({
        ...prev,
        propietario_id:     prop.id.toString(),
        rut:                prop.rut,
        comunidad_indigena: prop.comunidad_indigena,
        comunidad_nombre:   prop.comunidad_nombre || '',
        tipo_propietario:   prop.tipo_propietario || ''
      }))
      setPredioId(null)
    } else {
      setForm(prev => ({
        ...prev,
        propietario_id: '',
        rut: '',
        comunidad_indigena: false,
        comunidad_nombre: '',
        tipo_propietario: ''
      }))
      setPredioId(null)
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
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
    if (!form.propietario_id) { mostrarNotificacion('Debe seleccionar un propietario válido.', 'error'); return }
    if (!form.fecha_jornada)  { mostrarNotificacion('Debe seleccionar la fecha de la jornada.', 'error'); return }
    if (form.actividades.length === 0) { mostrarNotificacion('Debe seleccionar al menos una actividad.', 'error'); return }

    const actividadesFinal = form.actividades.includes('actividades_otros')
      ? [...form.actividades.filter(a => a !== 'actividades_otros'), form.actividad_otro].filter(Boolean)
      : form.actividades

    const payload = {
      propietario_id:               form.propietario_id,
      predio_id:                    predioId,
      rol:                          form.rol,
      nro_resolucion:               form.nro_resolucion,
      fecha_resolucion:             form.fecha_resolucion,
      fecha_jornada:                form.fecha_jornada,
      punto_referencia_huso:        form.punto_referencia_huso,
      punto_referencia_este:        form.punto_referencia_este,
      punto_referencia_norte:       form.punto_referencia_norte,
      superficie_total_predio:      form.superficie_total_predio,
      superficie_bajo_regimen:      form.superficie_bajo_regimen,
      superficie_manejada:          form.superficie_manejada,
      superficie_bosque_nativo:     form.superficie_bosque_nativo,
      superficie_anual_planificada: form.superficie_anual_planificada,
      superficie_marcada:           form.superficie_marcada,
      superficie_marcada_km:        form.superficie_marcada_km,
      observaciones:                form.observaciones,
      prescripciones:               form.prescripciones,
      medidas_proteccion:           form.medidas_proteccion,
      materiales_utilizados:        form.materiales_utilizados,
      actividades:                  actividadesFinal
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
      mostrarNotificacion('Jornada registrada con éxito', 'success')
    } catch (error) {
      mostrarNotificacion('Error al enviar los datos: ' + error.message, 'error')
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow">

      {notificacion && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl border shadow-lg transition-all duration-300 ${
          notificacion.tipo === 'success'
            ? 'bg-green-50 border-green-400 text-green-800'
            : 'bg-red-50 border-red-400 text-red-800'
        }`}>
          <span className="text-lg font-bold">{notificacion.tipo === 'success' ? '✓' : '✕'}</span>
          <p className="text-sm font-medium">{notificacion.mensaje}</p>
        </div>
      )}

      <button onClick={() => router.push('/extensionista')}
        className="flex items-center gap-2 text-green-700 hover:text-green-900 font-medium text-sm transition mb-4">
        ← Volver al Dashboard
      </button>

      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Registrar Jornada de Marcación</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Propietario */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">Propietario</label>
          <BuscadorPropietario
            propietarios={propietarios}
            value={form.propietario_id}
            onChange={handlePropietarioChange}
          />
          {form.propietario_id && (
            <div className="mt-2 text-sm text-gray-700 space-y-0.5">
              <p>RUT: {form.rut}</p>
              <p>Comunidad indígena: {form.comunidad_nombre || '—'}</p>
              <p>Tipo: {form.tipo_propietario || '—'}</p>
            </div>
          )}
        </div>

        {/* Selector de predio */}
        <SelectorPredio
          propietarioId={form.propietario_id}
          value={predioId}
          onChange={setPredioId}
        />

        {/* Datos básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de la Jornada *</label>
            <input name="fecha_jornada" type="date" value={form.fecha_jornada}
              onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">N° de Resolución Plan Manejo</label>
            <input name="nro_resolucion" placeholder="N° de Resolución"
              value={form.nro_resolucion} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de la Resolución</label>
            <input name="fecha_resolucion" type="date" value={form.fecha_resolucion}
              onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">ROL</label>
            <input name="rol" placeholder="ROL" value={form.rol}
              onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Punto Referencia HUSO</label>
            <input name="punto_referencia_huso" placeholder="HUSO"
              value={form.punto_referencia_huso} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Punto Referencia ESTE (m)</label>
            <input name="punto_referencia_este" type="number" step="0.01"
              placeholder="ESTE" value={form.punto_referencia_este}
              onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Punto Referencia NORTE (m)</label>
            <input name="punto_referencia_norte" type="number" step="0.01"
              placeholder="NORTE" value={form.punto_referencia_norte}
              onChange={handleChange} className={inputClass} />
          </div>
        </div>

        {/* Superficies */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input name="superficie_total_predio" type="number" step="0.01"
            placeholder="Superficie total (Ha)" value={form.superficie_total_predio}
            onChange={handleChange} className={inputClass} />
          <input name="superficie_bajo_regimen" type="number" step="0.01"
            placeholder="Sup. bajo régimen (Ha)" value={form.superficie_bajo_regimen}
            onChange={handleChange} className={inputClass} />
          <input name="superficie_manejada" type="number" step="0.01"
            placeholder="Sup. manejada (Ha)" value={form.superficie_manejada}
            onChange={handleChange} className={inputClass} />
          <input name="superficie_bosque_nativo" type="number" step="0.01"
            placeholder="Sup. bosque nativo (Ha)" value={form.superficie_bosque_nativo}
            onChange={handleChange} className={inputClass} />
          <input name="superficie_anual_planificada" type="number" step="0.01"
            placeholder="Sup. anual planificada (Ha)" value={form.superficie_anual_planificada}
            onChange={handleChange} className={inputClass} />
          <input name="superficie_marcada" type="number" step="0.01"
            placeholder="Sup. marcada (Ha)" value={form.superficie_marcada}
            onChange={handleChange} className={inputClass} />
          <input name="superficie_marcada_km" type="number" step="0.01"
            placeholder="Sup. marcada (Km)" value={form.superficie_marcada_km}
            onChange={handleChange} className={inputClass} />
        </div>

        {/* Actividades */}
        <fieldset className="border p-4 rounded">
          <legend className="font-semibold mb-3 text-gray-700">Actividades Realizadas</legend>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {actividadesOpciones.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" value={value}
                  checked={form.actividades.includes(value)}
                  onChange={handleActividadChange}
                  className="w-4 h-4 accent-green-600" />
                <span className="text-sm text-gray-800">{label}</span>
              </label>
            ))}
          </div>
          {form.actividades.includes('actividades_otros') && (
            <input type="text" name="actividad_otro" value={form.actividad_otro}
              onChange={handleChange} placeholder="Especifique otra actividad"
              className={`${inputClass} mt-3`} />
          )}
        </fieldset>

        {/* Textos */}
        <textarea name="observaciones" placeholder="Observaciones"
          value={form.observaciones} onChange={handleChange}
          className={`${inputClass} h-24`} />
        <textarea name="prescripciones" placeholder="Prescripciones técnicas"
          value={form.prescripciones} onChange={handleChange}
          className={`${inputClass} h-24`} />
        <textarea name="medidas_proteccion" placeholder="Medidas de protección"
          value={form.medidas_proteccion} onChange={handleChange}
          className={`${inputClass} h-24`} />
        <textarea name="materiales_utilizados" placeholder="Materiales utilizados (separados por comas)"
          value={form.materiales_utilizados} onChange={handleChange}
          className={`${inputClass} h-20`} />

        <button type="submit"
          className="bg-green-600 text-white py-3 px-6 rounded hover:bg-green-700 transition w-full font-semibold">
          Enviar Jornada
        </button>
      </form>
    </div>
  )
}