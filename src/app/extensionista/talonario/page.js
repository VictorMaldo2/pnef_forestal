'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SelectorPredio from '../../components/SelectorPredio'

const actividadesOpciones = [
  { value: 'recorrido_predial',          label: 'Recorrido predial' },
  { value: 'forestacion',                label: 'Forestación' },
  { value: 'interpretacion_ejecucion',   label: 'Interpretación ejecución plan de manejo' },
  { value: 'diseno_trazado_senderos',    label: 'Diseño y trazado de senderos' },
  { value: 'prevencion_incendios',       label: 'Prevención de Incendios Forestales' },
  { value: 'prevencion_seguridad',       label: 'Prevención y seguridad en faena forestal' },
  { value: 'medicion_volumenes',         label: 'Medición de volúmenes' },
  { value: 'comercializacion',           label: 'Comercialización' },
  { value: 'plan_secado_lena',           label: 'Plan de secado de leña' },
  { value: 'medicion_humedad_lena',      label: 'Medición y registro de % Humedad de Leña' },
  { value: 'seleccion_marcacion_bosque', label: 'Selección y marcación del bosque' },
  { value: 'seguimiento_ejecucion',      label: 'Seguimiento ejecución de actividades' },
  { value: 'costos_produccion',          label: 'Costos de producción y rendimientos' },
  { value: 'diversificacion_productivo', label: 'Diversificación y E. productivo' },
  { value: 'otro',                       label: 'Otro' },
]

const inputClass   = "border p-3 rounded w-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
const labelClass   = "block font-semibold mb-1 text-sm text-gray-700"
const sectionClass = "bg-gray-50 border rounded p-4 space-y-4"
const sectionTitle = "font-bold text-green-700 text-lg mb-3 border-b pb-2"

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
          value={seleccionado && !abierto ? `${seleccionado.nombre} — ${seleccionado.rut}` : busqueda}
          onChange={e => { setBusqueda(e.target.value); setAbierto(true); onChange(null) }}
          onFocus={() => { setAbierto(true); setBusqueda('') }}
          placeholder="Buscar propietario por nombre o RUT..."
          className="flex-1 p-3 text-sm text-gray-800 placeholder-gray-400 outline-none bg-white" />
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

export default function TalonarioTerrenoForm() {
  const { data: session }   = useSession()
  const router              = useRouter()
  const [propietarios, setPropietarios]                       = useState([])
  const [propietarioSeleccionado, setPropietarioSeleccionado] = useState(null)
  const [predioId, setPredioId]                               = useState(null)
  const [notificacion, setNotificacion]                       = useState(null)
  const [form, setForm] = useState({
    propietario_id: '',
    nro_talonario: '',
    tipo_recurso: '',
    fecha: new Date().toISOString().split('T')[0],
    punto_referencia_huso: '',
    punto_referencia_este: '',
    punto_referencia_norte: '',
    nombre_persona_presente: '',
    rol_persona_presente: '',
    actividades: [],
    observaciones: '',
    superficie_total_predio: '',
    superficie_anual_planificada: '',
    superficie_bajo_regimen: '',
    superficie_avance_ejecucion: '',
    recomendaciones_observaciones: '',
    medidas_prevencion_incendios: '',
    carbon_saco: '',
    lena_m3: '',
    madera_pulgada: '',
    durmientes: '',
    metros_rumas: '',
    hojas_corteza: '',
    visitantes_sendero: '',
    productos_otro_1: '',
    productos_otro_1_valor: '',
    productos_otro_2: '',
    productos_otro_2_valor: '',
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
      setPropietarioSeleccionado(prop)
      setForm(prev => ({ ...prev, propietario_id: prop.id.toString() }))
      setPredioId(null)
    } else {
      setPropietarioSeleccionado(null)
      setForm(prev => ({ ...prev, propietario_id: '' }))
      setPredioId(null)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
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
    if (!form.propietario_id) { mostrarNotificacion('Debe seleccionar un propietario.', 'error'); return }
    if (!form.tipo_recurso)   { mostrarNotificacion('Debe seleccionar el tipo de recurso.', 'error'); return }
    if (form.actividades.length === 0) { mostrarNotificacion('Debe seleccionar al menos una actividad.', 'error'); return }

    try {
      const res = await fetch('/api/talonario_terreno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, predio_id: predioId })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error desconocido')
      }
      mostrarNotificacion('Talonario registrado con éxito', 'success')
    } catch (error) {
      mostrarNotificacion('Error: ' + error.message, 'error')
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow space-y-6">

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
        className="flex items-center gap-2 text-green-700 hover:text-green-900 font-medium text-sm transition">
        ← Volver al Dashboard
      </button>

      <h1 className="text-3xl font-bold text-center text-green-800">Talonario de Terreno</h1>
      <p className="text-center text-gray-600 text-sm">Programa Nacional de Extensión Forestal</p>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Encabezado */}
        <div className={sectionClass}>
          <h2 className={sectionTitle}>Encabezado</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>N° Talonario</label>
              <input name="nro_talonario" value={form.nro_talonario}
                onChange={handleChange} className={inputClass} placeholder="N°" />
            </div>
            <div>
              <label className={labelClass}>Fecha de la Visita *</label>
              <input name="fecha" type="date" value={form.fecha}
                onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Tipo de Recurso</label>
              <div className="flex gap-4 mt-3">
                {[['bosque_nativo', 'Bosque Nativo'], ['plantaciones', 'Plantaciones']].map(([v, l]) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="tipo_recurso" value={v}
                      checked={form.tipo_recurso === v} onChange={handleChange}
                      className="accent-green-600" />
                    <span className="text-sm text-gray-800">{l}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Propietario */}
        <div className={sectionClass}>
          <h2 className={sectionTitle}>I. Antecedentes del Propietario</h2>
          <div>
            <label className={labelClass}>Propietario/a</label>
            <BuscadorPropietario
              propietarios={propietarios}
              value={form.propietario_id}
              onChange={handlePropietarioChange}
            />
          </div>

          {propietarioSeleccionado && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 bg-green-50 p-3 rounded text-sm text-gray-800">
              <div><span className="font-semibold">RUT:</span> {propietarioSeleccionado.rut}</div>
              <div><span className="font-semibold">Comuna:</span> {propietarioSeleccionado.comuna}</div>
              <div><span className="font-semibold">Tipo:</span> {propietarioSeleccionado.tipo_propietario}</div>
              <div><span className="font-semibold">Etnia:</span> {propietarioSeleccionado.comunidad_nombre || '—'}</div>
            </div>
          )}

          <SelectorPredio
            propietarioId={form.propietario_id}
            value={predioId}
            onChange={setPredioId}
          />

          <div className="grid grid-cols-3 gap-4 mt-2">
            <div>
              <label className={labelClass}>HUSO</label>
              <input name="punto_referencia_huso" value={form.punto_referencia_huso}
                onChange={handleChange} className={inputClass} placeholder="HUSO" />
            </div>
            <div>
              <label className={labelClass}>ESTE (m)</label>
              <input name="punto_referencia_este" type="number" step="0.01"
                value={form.punto_referencia_este} onChange={handleChange}
                className={inputClass} placeholder="ESTE" />
            </div>
            <div>
              <label className={labelClass}>NORTE (m)</label>
              <input name="punto_referencia_norte" type="number" step="0.01"
                value={form.punto_referencia_norte} onChange={handleChange}
                className={inputClass} placeholder="NORTE" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Nombre persona presente en el predio</label>
            <input name="nombre_persona_presente" value={form.nombre_persona_presente}
              onChange={handleChange} className={inputClass} placeholder="Nombre completo" />
          </div>
          <div>
            <label className={labelClass}>Rol de la persona presente</label>
            <div className="flex flex-wrap gap-4 mt-1">
              {[
                ['propietario', 'Propietario/a'],
                ['administrador', 'Administrador'],
                ['trabajador', 'Trabajador/a'],
                ['familiar', 'Familiar'],
                ['otro', 'Otro'],
              ].map(([v, l]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="rol_persona_presente" value={v}
                    checked={form.rol_persona_presente === v} onChange={handleChange}
                    className="accent-green-600" />
                  <span className="text-sm text-gray-800">{l}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actividades */}
        <div className={sectionClass}>
          <h2 className={sectionTitle}>Actividad / Producto Realizado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {actividadesOpciones.map(({ value, label }) => (
              <label key={value} className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" value={value}
                  checked={form.actividades.includes(value)}
                  onChange={handleActividadChange}
                  className="mt-1 accent-green-600" />
                <span className="text-sm text-gray-800">{label}</span>
              </label>
            ))}
          </div>
          <div className="mt-2">
            <label className={labelClass}>Observaciones</label>
            <textarea name="observaciones" value={form.observaciones}
              onChange={handleChange} className={`${inputClass} h-24`}
              placeholder="Observaciones de la actividad" />
          </div>
        </div>

        {/* Antecedentes del predio */}
        <div className={sectionClass}>
          <h2 className={sectionTitle}>Antecedentes del Predio y Avances de Faena</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['superficie_total_predio',      'Superficie total (Ha)'],
              ['superficie_anual_planificada', 'Sup. anual planificada (Ha)'],
              ['superficie_bajo_regimen',      'Sup. bajo régimen (Ha)'],
              ['superficie_avance_ejecucion',  'Avance ejecución (Ha o Km)'],
            ].map(([name, label]) => (
              <div key={name}>
                <label className={labelClass}>{label}</label>
                <input name={name} value={form[name]} onChange={handleChange}
                  className={inputClass} placeholder="—"
                  type={name === 'superficie_avance_ejecucion' ? 'text' : 'number'}
                  step="0.01" />
              </div>
            ))}
          </div>
        </div>

        {/* Secciones II y III */}
        <div className={sectionClass}>
          <h2 className={sectionTitle}>II. Recomendaciones y Observaciones</h2>
          <textarea name="recomendaciones_observaciones"
            value={form.recomendaciones_observaciones} onChange={handleChange}
            className={`${inputClass} h-24`} placeholder="Recomendaciones y observaciones" />

          <h2 className={`${sectionTitle} mt-4`}>III. Medidas de Prevención y Control de Incendios</h2>
          <textarea name="medidas_prevencion_incendios"
            value={form.medidas_prevencion_incendios} onChange={handleChange}
            className={`${inputClass} h-24`} placeholder="Medidas de prevención de incendios" />
        </div>

        {/* Productos del predio */}
        <div className={sectionClass}>
          <h2 className={sectionTitle}>Productos del Predio</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['carbon_saco',        'Carbón (saco)'],
              ['lena_m3',            'Leña (m3)'],
              ['madera_pulgada',     'Madera (Pulgada)'],
              ['durmientes',         'Durmientes'],
              ['metros_rumas',       'Metros Rumas'],
              ['hojas_corteza',      'Hojas / Corteza'],
              ['visitantes_sendero', 'Visitantes (sendero)'],
            ].map(([name, label]) => (
              <div key={name}>
                <label className={labelClass}>{label}</label>
                <input name={name} type="number" step="0.01"
                  value={form[name]} onChange={handleChange}
                  className={inputClass} placeholder="0" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className={labelClass}>Otro 1 — Nombre</label>
              <input name="productos_otro_1" value={form.productos_otro_1}
                onChange={handleChange} className={inputClass} placeholder="Nombre" />
            </div>
            <div>
              <label className={labelClass}>Otro 1 — Cantidad</label>
              <input name="productos_otro_1_valor" type="number" step="0.01"
                value={form.productos_otro_1_valor} onChange={handleChange}
                className={inputClass} placeholder="0" />
            </div>
            <div>
              <label className={labelClass}>Otro 2 — Nombre</label>
              <input name="productos_otro_2" value={form.productos_otro_2}
                onChange={handleChange} className={inputClass} placeholder="Nombre" />
            </div>
            <div>
              <label className={labelClass}>Otro 2 — Cantidad</label>
              <input name="productos_otro_2_valor" type="number" step="0.01"
                value={form.productos_otro_2_valor} onChange={handleChange}
                className={inputClass} placeholder="0" />
            </div>
          </div>
        </div>

        <button type="submit"
          className="bg-green-600 text-white py-3 px-6 rounded hover:bg-green-700 transition w-full text-lg font-semibold">
          Registrar Talonario
        </button>
      </form>
    </div>
  )
}