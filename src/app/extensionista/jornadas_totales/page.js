'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const TIPO_LABEL = {
  talonario: { label: 'Talonario de Terreno', color: 'bg-blue-100 text-blue-700' },
  marcacion:  { label: 'Jornada de Marcación', color: 'bg-green-100 text-green-700' },
}

function Modal({ jornada, onClose }) {
  if (!jornada) return null

  const esTalonario = jornada.tipo === 'talonario'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${TIPO_LABEL[jornada.tipo].color}`}>
              {TIPO_LABEL[jornada.tipo].label}
            </span>
            <h2 className="text-xl font-bold text-green-800 mt-1">
              {esTalonario ? `Talonario N° ${jornada.nro_talonario || jornada.id}` : `Jornada #${jornada.id}`}
            </h2>
          </div>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">

          <Seccion titulo="Participantes">
            <Fila label="Extensionista" valor={jornada.extensionista_nombre} />
            <Fila label="RUT Extensionista" valor={jornada.extensionista_rut} />
            <Fila label="Propietario" valor={jornada.propietario_nombre} />
            <Fila label="RUT Propietario" valor={jornada.propietario_rut} />
            <Fila label="Comuna" valor={jornada.propietario_comuna} />
          </Seccion>

          {esTalonario ? (
            <>
              <Seccion titulo="Encabezado">
                <Fila label="Fecha" valor={formatFecha(jornada.fecha)} />
                <Fila label="Tipo de Recurso" valor={jornada.tipo_recurso?.replace('_', ' ')} />
                <Fila label="N° Talonario" valor={jornada.nro_talonario} />
              </Seccion>

              <Seccion titulo="Punto de Referencia WGS84">
                <Fila label="HUSO" valor={jornada.punto_referencia_huso} />
                <Fila label="ESTE (m)" valor={jornada.punto_referencia_este} />
                <Fila label="NORTE (m)" valor={jornada.punto_referencia_norte} />
              </Seccion>

              <Seccion titulo="Persona Presente">
                <Fila label="Nombre" valor={jornada.nombre_persona_presente} />
                <Fila label="Rol" valor={jornada.rol_persona_presente} />
              </Seccion>

              <Seccion titulo="Actividades Realizadas">
                <ListaArray items={jornada.actividades} />
              </Seccion>

              <Seccion titulo="Observaciones">
                <Texto valor={jornada.observaciones} />
              </Seccion>

              <Seccion titulo="Antecedentes del Predio y Avances">
                <Fila label="Superficie total (Ha)" valor={jornada.superficie_total_predio} />
                <Fila label="Sup. anual planificada (Ha)" valor={jornada.superficie_anual_planificada} />
                <Fila label="Sup. bajo régimen (Ha)" valor={jornada.superficie_bajo_regimen} />
                <Fila label="Avance ejecución" valor={jornada.superficie_avance_ejecucion} />
              </Seccion>

              <Seccion titulo="II. Recomendaciones y Observaciones">
                <Texto valor={jornada.recomendaciones_observaciones} />
              </Seccion>

              <Seccion titulo="III. Medidas de Prevención de Incendios">
                <Texto valor={jornada.medidas_prevencion_incendios} />
              </Seccion>

              <Seccion titulo="Productos del Predio">
                <Fila label="Carbón (saco)" valor={jornada.carbon_saco} />
                <Fila label="Leña (m3)" valor={jornada.lena_m3} />
                <Fila label="Madera (Pulgada)" valor={jornada.madera_pulgada} />
                <Fila label="Durmientes" valor={jornada.durmientes} />
                <Fila label="Metros Rumas" valor={jornada.metros_rumas} />
                <Fila label="Hojas / Corteza" valor={jornada.hojas_corteza} />
                <Fila label="Visitantes (sendero)" valor={jornada.visitantes_sendero} />
                {jornada.productos_otro_1 && (
                  <Fila label={jornada.productos_otro_1} valor={jornada.productos_otro_1_valor} />
                )}
                {jornada.productos_otro_2 && (
                  <Fila label={jornada.productos_otro_2} valor={jornada.productos_otro_2_valor} />
                )}
              </Seccion>

              <Seccion titulo="Firma">
                <Fila label="Firma Propietario" valor={jornada.firma_propietario} />
              </Seccion>
            </>
          ) : (
            <>
              <Seccion titulo="Datos de la Jornada">
                <Fila label="Fecha" valor={formatFecha(jornada.fecha)} />
                <Fila label="N° Resolución" valor={jornada.nro_resolucion} />
                <Fila label="Fecha Resolución" valor={formatFecha(jornada.fecha_resolucion)} />
                <Fila label="Nombre Predio" valor={jornada.nombre_predio} />
                <Fila label="ROL" valor={jornada.rol} />
              </Seccion>

              <Seccion titulo="Punto de Referencia WGS84">
                <Fila label="HUSO" valor={jornada.punto_referencia_huso} />
                <Fila label="ESTE (m)" valor={jornada.punto_referencia_este} />
                <Fila label="NORTE (m)" valor={jornada.punto_referencia_norte} />
              </Seccion>

              <Seccion titulo="Actividades Realizadas">
                <ListaArray items={jornada.actividades} />
              </Seccion>

              <Seccion titulo="Superficies">
                <Fila label="Superficie total (Ha)" valor={jornada.superficie_total_predio} />
                <Fila label="Sup. bajo régimen (Ha)" valor={jornada.superficie_bajo_regimen} />
                <Fila label="Sup. manejada (Ha)" valor={jornada.superficie_manejada} />
                <Fila label="Sup. bosque nativo (Ha)" valor={jornada.superficie_bosque_nativo} />
                <Fila label="Sup. anual planificada (Ha)" valor={jornada.superficie_anual_planificada} />
                <Fila label="Sup. marcada (Ha)" valor={jornada.superficie_marcada} />
                <Fila label="Sup. marcada (Km)" valor={jornada.superficie_marcada_km} />
              </Seccion>

              <Seccion titulo="Observaciones y Prescripciones">
                <Texto label="Observaciones" valor={jornada.observaciones} />
                <Texto label="Prescripciones técnicas" valor={jornada.prescripciones} />
                <Texto label="Medidas de protección" valor={jornada.medidas_proteccion} />
                <Texto label="Materiales utilizados" valor={jornada.materiales_utilizados} />
              </Seccion>

              <Seccion titulo="Firmas">
                <Fila label="Firma Extensionista" valor={jornada.firma_extensionista} />
                <Fila label="Firma Supervisor" valor={jornada.firma_supervisor} />
                <Fila label="Firma Propietario" valor={jornada.firma_propietario} />
              </Seccion>
            </>
          )}

          <div className="text-xs text-gray-400 text-right pt-2 border-t">
            Registrado el {formatFecha(jornada.creado_en)}
          </div>
        </div>
      </div>
    </div>
  )
}

function Seccion({ titulo, children }) {
  return (
    <div>
      <h3 className="font-bold text-green-700 text-sm uppercase tracking-wide mb-2 border-b pb-1">
        {titulo}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function Fila({ label, valor }) {
  return (
    <div className="flex justify-between text-sm py-1 border-b border-gray-50">
      <span className="text-gray-500 w-1/2">{label}</span>
      <span className="font-medium text-gray-800 w-1/2 text-right">{valor ?? '—'}</span>
    </div>
  )
}

function Texto({ label, valor }) {
  if (!valor) return null
  return (
    <div className="text-sm py-1">
      {label && <p className="text-gray-500 mb-1">{label}</p>}
      <p className="text-gray-800 bg-gray-50 rounded p-2">{valor}</p>
    </div>
  )
}

function ListaArray({ items }) {
  const lista = Array.isArray(items)
    ? items
    : typeof items === 'string'
      ? items.replace(/[{}"]/g, '').split(',').filter(Boolean)
      : []

  if (lista.length === 0) return <p className="text-sm text-gray-400">Sin actividades</p>

  return (
    <ul className="space-y-1">
      {lista.map((item, i) => (
        <li key={i} className="text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block shrink-0" />
          {item.trim()}
        </li>
      ))}
    </ul>
  )
}

function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-CL')
}

export default function JornadasTotalesPage() {
  const router                          = useRouter()
  const { data: session }               = useSession()
  const esAdmin                         = session?.user?.roleId === 1
  const [jornadas, setJornadas]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [jornadaModal, setJornadaModal] = useState(null)
  const [busqueda, setBusqueda]         = useState('')
  const [filtroTipo, setFiltroTipo]     = useState('todos')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')

  useEffect(() => {
    async function fetchJornadas() {
      try {
        const res = await fetch('/api/jornada_completa')
        if (!res.ok) throw new Error('Error cargando jornadas')
        const data = await res.json()
        setJornadas(data)
      } catch (error) {
        alert(error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchJornadas()
  }, [])

  const jornadasFiltradas = useMemo(() => {
    return jornadas.filter(j => {
      const texto = busqueda.toLowerCase()
      const coincideTexto =
        !texto ||
        (j.propietario_nombre?.toLowerCase() || '').includes(texto) ||
        (j.propietario_rut?.toLowerCase() || '').includes(texto) ||
        (j.extensionista_nombre?.toLowerCase() || '').includes(texto) ||
        (j.propietario_comuna?.toLowerCase() || '').includes(texto)

      const coincideTipo  = filtroTipo === 'todos' || j.tipo === filtroTipo
      const fecha         = new Date(j.fecha)
      const coincideDesde = !filtroFechaDesde || fecha >= new Date(filtroFechaDesde)
      const coincideHasta = !filtroFechaHasta || fecha <= new Date(filtroFechaHasta)

      return coincideTexto && coincideTipo && coincideDesde && coincideHasta
    })
  }, [jornadas, busqueda, filtroTipo, filtroFechaDesde, filtroFechaHasta])

  function limpiarFiltros() {
    setBusqueda('')
    setFiltroTipo('todos')
    setFiltroFechaDesde('')
    setFiltroFechaHasta('')
  }

  function verDetalle(jornada) {
    setJornadaModal(jornada)
  }

  // columnas según rol
  const columnas = esAdmin
    ? ['Tipo', 'Fecha', 'N° / ID', 'Propietario', 'RUT', 'Comuna', 'Extensionista', 'Actividades', 'Sup. Total (Ha)', 'Ver']
    : ['Tipo', 'Fecha', 'N° / ID', 'Propietario', 'RUT', 'Comuna', 'Actividades', 'Sup. Total (Ha)', 'Ver']

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      <button
        onClick={() => router.push('/extensionista')}
        className="flex items-center gap-2 text-green-700 hover:text-green-900 font-medium text-sm transition">
        ← Volver al Dashboard
      </button>

      <h1 className="text-3xl font-bold text-green-800">Jornadas Totales</h1>
      <p className="text-gray-500 text-sm">
        Talonarios de terreno y jornadas de marcación registradas
      </p>

      {/* Filtros */}
      <div className="bg-gray-50 border rounded p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por propietario, RUT, comuna..."
            className="border p-3 rounded w-full col-span-1 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
            className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="todos">Todos los tipos</option>
            <option value="talonario">Talonario de Terreno</option>
            <option value="marcacion">Jornada de Marcación</option>
          </select>
          <button onClick={limpiarFiltros}
            className="border p-3 rounded w-full text-gray-600 hover:bg-gray-100 transition">
            Limpiar filtros
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-600">Fecha desde</label>
            <input type="date" value={filtroFechaDesde}
              onChange={e => setFiltroFechaDesde(e.target.value)}
              className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-600">Fecha hasta</label>
            <input type="date" value={filtroFechaHasta}
              onChange={e => setFiltroFechaHasta(e.target.value)}
              className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
      </div>

      {/* Contador */}
      <p className="text-sm text-gray-500">
        Mostrando <span className="font-semibold text-green-700">{jornadasFiltradas.length}</span> de{' '}
        <span className="font-semibold">{jornadas.length}</span> registros
      </p>

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando jornadas...</div>
      ) : jornadasFiltradas.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No se encontraron registros.</div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-green-700 text-white">
              <tr>
                {columnas.map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jornadasFiltradas.map((j, i) => (
                <tr key={`${j.tipo}-${j.id}`}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${TIPO_LABEL[j.tipo].color}`}>
                      {TIPO_LABEL[j.tipo].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatFecha(j.fecha)}</td>
                  <td className="px-4 py-3">{j.nro_talonario || `#${j.id}`}</td>
                  <td className="px-4 py-3 font-medium">{j.propietario_nombre || '—'}</td>
                  <td className="px-4 py-3">{j.propietario_rut || '—'}</td>
                  <td className="px-4 py-3">{j.propietario_comuna || '—'}</td>
                  {esAdmin && (
                    <td className="px-4 py-3">{j.extensionista_nombre || '—'}</td>
                  )}
                  <td className="px-4 py-3">
                    {Array.isArray(j.actividades) && j.actividades.length > 0
                      ? j.actividades.slice(0, 2).join(', ') +
                        (j.actividades.length > 2 ? ` +${j.actividades.length - 2}` : '')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">{j.superficie_total_predio ?? '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => verDetalle(j)}
                      className="bg-green-600 text-white text-xs px-3 py-1.5 rounded hover:bg-green-700 transition">
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal jornada={jornadaModal} onClose={() => setJornadaModal(null)} />
    </div>
  )
}