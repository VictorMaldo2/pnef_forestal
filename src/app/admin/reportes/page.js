'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

function fmt(n) { return n != null ? Number(n).toLocaleString('es-CL') : '—' }

const MES_LABEL = {
  '01':'Ene','02':'Feb','03':'Mar','04':'Abr','05':'May','06':'Jun',
  '07':'Jul','08':'Ago','09':'Sep','10':'Oct','11':'Nov','12':'Dic',
}
function mesCorto(yyyymm) {
  if (!yyyymm) return ''
  const [, m] = yyyymm.split('-')
  return MES_LABEL[m] || yyyymm
}

const ACTIVIDADES_LABELS = {
  recorrido_predial:                 'Recorrido predial',
  forestacion:                       'Forestación',
  interpretacion_ejecucion:          'Interpretación plan de manejo',
  diseno_trazado_senderos:           'Diseño y trazado de senderos',
  prevencion_incendios:              'Prevención de Incendios',
  prevencion_seguridad:              'Prevención y seguridad en faena',
  medicion_volumenes:                'Medición de volúmenes',
  comercializacion:                  'Comercialización',
  plan_secado_lena:                  'Plan de secado de leña',
  medicion_humedad_lena:             'Medición % Humedad de Leña',
  seleccion_marcacion_bosque:        'Selección y marcación del bosque',
  seguimiento_ejecucion:             'Seguimiento ejecución actividades',
  costos_produccion:                 'Costos de producción',
  diversificacion_productivo:        'Diversificación y E. productivo',
  otro:                              'Otro',
  supresion_de_especies_exoticas:    'Supresión de Especies Exóticas',
  corta_liberacion:                  'Corta de Liberación',
  raleo:                             'Raleo',
  corta_sanitaria:                   'Corta Sanitaria',
  renovacion_de_bosques:             'Renovación de Bosques',
  podas:                             'Podas',
  corte_de_maderables_no_maderables: 'Corte de Maderables',
  medidas_control_erosion:           'Control de Erosión',
  aplicacion_de_plaguicidas:         'Aplicación de Plaguicidas',
  abonos:                            'Abonos',
  deforestacion:                     'Deforestación',
  siembra_y_resiembra:               'Siembra y Resiembra',
  cortas_mayores:                    'Cortas Mayores',
  actividades_otros:                 'Otras',
  'Inspección':                      'Visita jornada marcación',
  'Revisión':                        'Visita talonario terreno',
  'Mantenimiento':                   'Visita regular',
  'Capacitación':                    'Capacitación',
}

function actLabel(key) {
  return ACTIVIDADES_LABELS[key] || key
}

function KpiCard({ label, value, sub }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-green-700">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function BarraHorizontal({ label, valor, max, sufijo = '' }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-700 w-48 truncate shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded h-2 overflow-hidden">
        <div className="h-2 rounded transition-all"
          style={{ width: `${pct}%`, background: valor === 0 ? '#e5e7eb' : '#22c55e' }} />
      </div>
      <span className={`text-sm w-16 text-right shrink-0 ${valor === 0 ? 'text-gray-300' : 'text-gray-600'}`}>
        {fmt(valor)}{sufijo}
      </span>
    </div>
  )
}

function TablaActividades({ actividades, totalJornadas }) {
  const max = Math.max(...actividades.map(a => a.total), 1)
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Actividad</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase w-20">Veces</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase w-16">%</th>
            <th className="py-2 px-3 w-40 hidden sm:table-cell"></th>
          </tr>
        </thead>
        <tbody>
          {actividades.map((a, i) => {
            const pct    = totalJornadas > 0 ? Math.round((a.total / totalJornadas) * 100) : 0
            const barPct = Math.round((a.total / max) * 100)
            return (
              <tr key={a.value} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className={`py-2 px-3 ${a.total === 0 ? 'text-gray-300' : 'text-gray-700'}`}>
                  {actLabel(a.label || a.value)}
                </td>
                <td className={`py-2 px-3 text-right font-bold ${a.total === 0 ? 'text-gray-300' : 'text-green-700'}`}>{a.total}</td>
                <td className={`py-2 px-3 text-right text-xs ${a.total === 0 ? 'text-gray-300' : 'text-gray-500'}`}>{pct}%</td>
                <td className="py-2 px-3 hidden sm:table-cell">
                  <div className="bg-gray-100 rounded h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded transition-all"
                      style={{ width: `${barPct}%`, background: a.total === 0 ? '#e5e7eb' : '#22c55e' }} />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function GraficoMes({ datos }) {
  if (!datos?.length) return <p className="text-sm text-gray-400 text-center py-8">Sin datos</p>
  const maxVal = Math.max(...datos.map(d => (d.talonarios || 0) + (d.marcaciones || 0)), 1)
  return (
    <div className="flex items-end gap-1 sm:gap-2 h-32 pt-2 overflow-x-auto">
      {datos.map(d => {
        const total = (d.talonarios || 0) + (d.marcaciones || 0)
        const hT    = Math.round((d.talonarios / maxVal) * 100)
        const hM    = Math.round((d.marcaciones / maxVal) * 100)
        return (
          <div key={d.mes} className="flex-1 min-w-[32px] flex flex-col items-center gap-1">
            <span className="text-xs text-gray-400">{total}</span>
            <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
              <div className="w-full bg-blue-200 rounded-t" style={{ height: `${hM}%` }} />
              <div className="w-full bg-green-400 rounded-t" style={{ height: `${hT}%` }} />
            </div>
            <span className="text-xs text-gray-400">{mesCorto(d.mes)}</span>
          </div>
        )
      })}
    </div>
  )
}

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

  const filtrados    = propietarios.filter(p => `${p.nombre}`.toLowerCase().includes(busqueda.toLowerCase()))
  const seleccionado = propietarios.find(p => p.nombre === value)

  function seleccionar(p) { onChange(p.nombre); setBusqueda(''); setAbierto(false) }
  function limpiar() { onChange(''); setBusqueda('') }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center border rounded text-sm overflow-hidden focus-within:ring-2 focus-within:ring-green-500 bg-white">
        <input type="text"
          value={seleccionado && !abierto ? seleccionado.nombre : busqueda}
          onChange={e => { setBusqueda(e.target.value); setAbierto(true); onChange('') }}
          onFocus={() => { setAbierto(true); setBusqueda('') }}
          placeholder="Buscar propietario..."
          className="flex-1 p-2 outline-none text-sm" />
        {value && <button type="button" onClick={limpiar} className="px-2 text-gray-400 hover:text-gray-600">✕</button>}
      </div>
      {abierto && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-xl max-h-52 overflow-y-auto">
          {filtrados.length === 0
            ? <p className="px-4 py-3 text-sm text-gray-400">No se encontraron propietarios</p>
            : filtrados.map(p => (
                <button key={p.id} type="button" onClick={() => seleccionar(p)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 hover:text-green-700 transition-colors border-b border-gray-50 last:border-0">
                  {p.nombre}
                </button>
              ))
          }
        </div>
      )}
    </div>
  )
}

function BuscadorPredio({ predios, value, onChange }) {
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

  const filtrados    = predios.filter(p => `${p.nombre}`.toLowerCase().includes(busqueda.toLowerCase()))
  const seleccionado = predios.find(p => p.nombre === value)

  function seleccionar(p) { onChange(p.nombre); setBusqueda(''); setAbierto(false) }
  function limpiar() { onChange(''); setBusqueda('') }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center border rounded text-sm overflow-hidden focus-within:ring-2 focus-within:ring-green-500 bg-white">
        <input type="text"
          value={seleccionado && !abierto ? seleccionado.nombre : busqueda}
          onChange={e => { setBusqueda(e.target.value); setAbierto(true); onChange('') }}
          onFocus={() => { setAbierto(true); setBusqueda('') }}
          placeholder="Buscar predio..."
          className="flex-1 p-2 outline-none text-sm" />
        {value && <button type="button" onClick={limpiar} className="px-2 text-gray-400 hover:text-gray-600">✕</button>}
      </div>
      {abierto && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-xl max-h-52 overflow-y-auto">
          {filtrados.length === 0
            ? <p className="px-4 py-3 text-sm text-gray-400">No se encontraron predios</p>
            : filtrados.map(p => (
                <button key={p.id} type="button" onClick={() => seleccionar(p)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 hover:text-green-700 transition-colors border-b border-gray-50 last:border-0">
                  {p.nombre}
                </button>
              ))
          }
        </div>
      )}
    </div>
  )
}

export default function ReportesPage() {
  const router     = useRouter()
  const reporteRef = useRef(null)

  const [data, setData]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [exportando, setExportando] = useState(false)
  const [notificacion, setNotificacion] = useState(null)
  const [desde, setDesde]           = useState('')
  const [hasta, setHasta]           = useState('')
  const [extensionista, setExtensionista] = useState('')
  const [comuna, setComuna]         = useState('')
  const [propietario, setPropietario]     = useState('')
  const [comunidad, setComunidad]         = useState('')
  const [predio, setPredio]               = useState('')

  useEffect(() => {
    if (!notificacion) return
    const t = setTimeout(() => setNotificacion(null), 3000)
    return () => clearTimeout(t)
  }, [notificacion])

  useEffect(() => {
    let cancelado = false
    async function fetchData() {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams()
        if (desde)         params.set('desde', desde)
        if (hasta)         params.set('hasta', hasta)
        if (extensionista) params.set('extensionista', extensionista)
        if (comuna)        params.set('comuna', comuna)
        if (propietario)   params.set('propietario', propietario)
        if (comunidad)     params.set('comunidad', comunidad)
        if (predio)        params.set('predio', predio)
        const res = await fetch(`/api/reportes?${params}`)
        if (!res.ok) throw new Error('Error cargando reportes')
        const json = await res.json()
        if (!cancelado) setData(json)
      } catch (e) {
        if (!cancelado) setError(e.message)
      } finally {
        if (!cancelado) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelado = true }
  }, [desde, hasta, extensionista, comuna, propietario, comunidad, predio])

  function limpiar() {
    setDesde(''); setHasta(''); setExtensionista('')
    setComuna(''); setPropietario(''); setComunidad(''); setPredio('')
  }

  async function exportarPDF() {
    if (!data || !reporteRef.current) return
    setExportando(true)
    try {
      const html2canvas = (await import('html2canvas-pro')).default
      const { jsPDF }   = await import('jspdf')
      const canvas = await html2canvas(reporteRef.current, {
        scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff',
      })
      const imgData    = canvas.toDataURL('image/png')
      const doc        = new jsPDF('p', 'mm', 'a4')
      const pageWidth  = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const imgWidth   = pageWidth
      const imgHeight  = (canvas.height * pageWidth) / canvas.width
      let posY = 0
      while (posY < imgHeight) {
        doc.addImage(imgData, 'PNG', 0, -posY, imgWidth, imgHeight)
        posY += pageHeight
        if (posY < imgHeight) doc.addPage()
      }
      doc.save('reporte_jornadas.pdf')
    } catch (e) {
      setNotificacion({ mensaje: 'Error al exportar: ' + e.message, tipo: 'error' })
    } finally {
      setExportando(false)
    }
  }

  const kpis      = data?.kpis
  const maxComuna = Math.max(...(data?.porComuna?.map(r => r.jornadas) || [0]))
  const maxExt    = Math.max(...(data?.porExtensionista?.map(r => r.jornadas) || [0]))
  const maxAct    = Math.max(...(data?.actividades?.map(r => r.total) || [0]))
  const maxActV   = Math.max(...(data?.actividadesVisitas?.map(r => r.total) || [0]))
  const maxPredio = Math.max(...(data?.porPredio?.map(r => r.jornadas + r.visitas) || [0]))
  const pctEjec   = kpis?.sup_planificada > 0
    ? Math.round((kpis.sup_ejecutada / kpis.sup_planificada) * 100) : 0

  const inputClass = "border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full"

  return (
    <div className="bg-white min-h-screen">

      {notificacion && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${
          notificacion.tipo === 'error'
            ? 'bg-red-50 border-red-400 text-red-800'
            : 'bg-green-50 border-green-400 text-green-800'
        }`}>
          <span className="text-lg font-bold">{notificacion.tipo === 'error' ? '✕' : '✓'}</span>
          <p className="text-sm font-medium">{notificacion.mensaje}</p>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button onClick={() => router.push('/admin')}
            className="text-green-700 hover:text-green-900 text-sm font-medium mb-2 flex items-center gap-1">
            ← Volver al Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800">Reportes</h1>
          <p className="text-gray-500 text-sm">Jornadas de terreno, marcación y visitas — PNEF</p>
        </div>
        <button onClick={exportarPDF} disabled={exportando || !data}
          className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          {exportando ? '⏳ Generando PDF...' : '📄 Exportar PDF'}
        </button>
      </div>

      <div ref={reporteRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 bg-white">

        {/* Filtros */}
        <div className="bg-gray-50 border rounded p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Desde</label>
              <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Hasta</label>
              <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Extensionista</label>
              <select value={extensionista} onChange={e => setExtensionista(e.target.value)} className={inputClass}>
                <option value="">Todos</option>
                {data?.extensionistas?.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Comuna</label>
              <select value={comuna} onChange={e => setComuna(e.target.value)} className={inputClass}>
                <option value="">Todas</option>
                {data?.comunas?.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Propietario</label>
              <BuscadorPropietario
                propietarios={data?.propietarios || []}
                value={propietario}
                onChange={setPropietario}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Comunidad indígena</label>
              <select value={comunidad} onChange={e => setComunidad(e.target.value)} className={inputClass}>
                <option value="">Todas</option>
                {data?.comunidades?.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Predio</label>
              <BuscadorPredio
                predios={data?.predios || []}
                value={predio}
                onChange={setPredio}
              />
            </div>
          </div>
          <button onClick={limpiar} className="text-sm text-gray-500 hover:text-gray-700 underline">
            Limpiar filtros
          </button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {loading ? (
          <div className="text-center py-20 text-gray-400 animate-pulse">Cargando reporte...</div>
        ) : (
          <>
            <h2 className="text-lg sm:text-xl font-bold text-green-800">Jornadas de terreno</h2>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <KpiCard label="Total jornadas"      value={fmt(kpis?.total)} />
              <KpiCard label="Talonarios"          value={fmt(kpis?.talonarios)} />
              <KpiCard label="Marcaciones"         value={fmt(kpis?.marcaciones)} />
              <KpiCard label="Propietarios"        value={fmt(kpis?.propietarios)} />
              <KpiCard label="Sup. total (Ha)"     value={fmt(kpis?.sup_total)} />
              <KpiCard label="Sup. ejecutada (Ha)" value={fmt(kpis?.sup_ejecutada)}
                sub={kpis?.sup_planificada ? `de ${fmt(kpis.sup_planificada)} Ha planificadas` : ''} />
            </div>

            {/* Barra avance */}
            {kpis?.sup_planificada > 0 && (
              <div className="bg-white border rounded p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Avance superficie — {pctEjec}% ejecutado
                </p>
                <div className="bg-gray-100 rounded h-4 overflow-hidden">
                  <div className="h-4 bg-green-500 rounded transition-all"
                    style={{ width: `${Math.min(pctEjec, 100)}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0 Ha</span>
                  <span>{fmt(kpis.sup_planificada)} Ha planificadas</span>
                </div>
              </div>
            )}

            {/* Gráfico + Top actividades */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border rounded p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Jornadas por mes</p>
                <GraficoMes datos={data?.porMes} />
                <div className="flex gap-4 mt-2">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-3 h-3 bg-green-400 rounded inline-block" /> Talonarios
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-3 h-3 bg-blue-200 rounded inline-block" /> Marcaciones
                  </span>
                </div>
              </div>
              <div className="bg-white border rounded p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Top 10 actividades combinadas</p>
                {data?.actividades?.map(a => (
                  <BarraHorizontal
                    key={a.actividad}
                    label={actLabel(a.actividad)}
                    valor={a.total}
                    max={maxAct}
                  />
                ))}
              </div>
            </div>

            {/* Rendimiento extensionista */}
            <div className="bg-white border rounded overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <p className="text-sm font-semibold text-gray-700">Rendimiento por extensionista</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-green-700 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Extensionista</th>
                      <th className="px-4 py-3 text-left">Jornadas</th>
                      <th className="px-4 py-3 text-left hidden sm:table-cell">Propietarios</th>
                      <th className="px-4 py-3 text-left hidden sm:table-cell">Sup. total (Ha)</th>
                      <th className="px-4 py-3 text-left">Participación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.porExtensionista?.map((r, i) => (
                      <tr key={r.extensionista_nombre} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 font-medium">{r.extensionista_nombre || '—'}</td>
                        <td className="px-4 py-3">{fmt(r.jornadas)}</td>
                        <td className="px-4 py-3 hidden sm:table-cell">{fmt(r.propietarios)}</td>
                        <td className="px-4 py-3 hidden sm:table-cell">{fmt(r.sup_total)}</td>
                        <td className="px-4 py-3 w-32 sm:w-40">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded h-1.5 overflow-hidden">
                              <div className="h-1.5 bg-green-500 rounded"
                                style={{ width: `${maxExt > 0 ? Math.round((r.jornadas / maxExt) * 100) : 0}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-8 text-right">
                              {kpis?.total > 0 ? Math.round((r.jornadas / kpis.total) * 100) : 0}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cobertura + Productos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border rounded p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Cobertura por comuna</p>
                {data?.porComuna?.length
                  ? data.porComuna.map(r => (
                      <BarraHorizontal key={r.comuna} label={r.comuna || '—'}
                        valor={r.jornadas} max={maxComuna} sufijo=' jornadas' />
                    ))
                  : <p className="text-sm text-gray-400">Sin datos</p>
                }
              </div>
              <div className="bg-white border rounded p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Productos del predio — acumulado</p>
                {[
                  ['Leña',         data?.productos?.lena_m3,        'm³'],
                  ['Carbón',       data?.productos?.carbon_saco,    'sacos'],
                  ['Madera',       data?.productos?.madera_pulgada, 'pulg.'],
                  ['Durmientes',   data?.productos?.durmientes,     'un.'],
                  ['Metros rumas', data?.productos?.metros_rumas,   'm'],
                ].map(([label, valor, unidad]) => (
                  <div key={label} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-800">
                      {valor != null && valor > 0 ? `${fmt(valor)} ${unidad}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Predios */}
            {data?.porPredio?.length > 0 && (
              <div className="border-t pt-6 space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-green-800">Actividad por predio</h2>
                <div className="bg-white border rounded overflow-hidden">
                  <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">Predios más activos</p>
                    <span className="text-xs text-gray-400">{data.porPredio.length} predios</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-green-700 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left">Predio</th>
                          <th className="px-4 py-3 text-left hidden sm:table-cell">ROL</th>
                          <th className="px-4 py-3 text-left">Jornadas</th>
                          <th className="px-4 py-3 text-left">Visitas</th>
                          <th className="px-4 py-3 text-left hidden sm:table-cell">Sup. total (Ha)</th>
                          <th className="px-4 py-3 text-left">Actividad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.porPredio.map((r, i) => {
                          const total = r.jornadas + r.visitas
                          const pct   = maxPredio > 0 ? Math.round((total / maxPredio) * 100) : 0
                          return (
                            <tr key={r.predio_nombre} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-3 font-medium">{r.predio_nombre || '—'}</td>
                              <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{r.rol || '—'}</td>
                              <td className="px-4 py-3">{fmt(r.jornadas)}</td>
                              <td className="px-4 py-3">{fmt(r.visitas)}</td>
                              <td className="px-4 py-3 hidden sm:table-cell">{fmt(r.sup_total)} Ha</td>
                              <td className="px-4 py-3 w-32">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-100 rounded h-1.5 overflow-hidden">
                                    <div className="h-1.5 bg-green-500 rounded" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-xs text-gray-400 w-6 text-right">{total}</span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Detalle actividades */}
            <div className="border-t pt-6 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-green-800">Detalle de actividades</h2>
              <p className="text-sm text-gray-500">
                Todas las actividades posibles y cuántas veces fueron realizadas en el período.
                Las actividades en gris no tienen registros.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border rounded overflow-hidden">
                  <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">Talonario de Terreno</p>
                    <span className="text-xs text-gray-400">
                      {data?.actividadesTalonario?.filter(a => a.total > 0).length} de{' '}
                      {data?.actividadesTalonario?.length} realizadas
                    </span>
                  </div>
                  <div className="p-4">
                    <TablaActividades
                      actividades={data?.actividadesTalonario || []}
                      totalJornadas={kpis?.talonarios || 0}
                    />
                  </div>
                </div>
                <div className="bg-white border rounded overflow-hidden">
                  <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">Jornada de Marcación</p>
                    <span className="text-xs text-gray-400">
                      {data?.actividadesMarcacion?.filter(a => a.total > 0).length} de{' '}
                      {data?.actividadesMarcacion?.length} realizadas
                    </span>
                  </div>
                  <div className="p-4">
                    <TablaActividades
                      actividades={data?.actividadesMarcacion || []}
                      totalJornadas={kpis?.marcaciones || 0}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Visitas */}
            <div className="border-t pt-6 space-y-6">
              <h2 className="text-lg sm:text-xl font-bold text-green-800">Visitas a propietarios</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <KpiCard label="Total visitas"          value={fmt(data?.kpiVisitas?.total)} />
                <KpiCard label="Completadas"            value={fmt(data?.kpiVisitas?.completadas)} />
                <KpiCard label="Pendientes"             value={fmt(data?.kpiVisitas?.pendientes)} />
                <KpiCard label="Canceladas"             value={fmt(data?.kpiVisitas?.canceladas)} />
                <KpiCard label="Propietarios visitados" value={fmt(data?.kpiVisitas?.propietarios_con_visita)} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border rounded p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Visitas por extensionista</p>
                  {data?.visitasPorExtensionista?.map((r, i) => (
                    <div key={r.extensionista_nombre}
                      className={`flex flex-wrap justify-between items-center py-2 border-b border-gray-50 last:border-0 text-sm gap-2 ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                      <span className="text-gray-700 font-medium truncate shrink-0 max-w-[140px]">
                        {r.extensionista_nombre || '—'}
                      </span>
                      <div className="flex gap-1 sm:gap-2 text-xs">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{r.completadas} ✓</span>
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{r.pendientes} ⏳</span>
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{r.canceladas} ✗</span>
                      </div>
                      <span className="text-gray-400 text-xs shrink-0">{r.propietarios_visitados} prop.</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white border rounded p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Actividades en visitas</p>
                  {data?.actividadesVisitas?.length
                    ? data.actividadesVisitas.map(a => (
                        <BarraHorizontal
                          key={a.actividad}
                          label={actLabel(a.actividad)}
                          valor={a.total}
                          max={maxActV}
                        />
                      ))
                    : <p className="text-sm text-gray-400">Sin datos</p>
                  }
                </div>
              </div>

              {/* Tabla detalle propietarios */}
              <div className="bg-white border rounded overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <p className="text-sm font-semibold text-gray-700">
                    Detalle por propietario ({data?.visitasPorPropietario?.length || 0})
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-green-700 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left">Propietario</th>
                        <th className="px-4 py-3 text-left hidden sm:table-cell">RUT</th>
                        <th className="px-4 py-3 text-left hidden md:table-cell">Comuna</th>
                        <th className="px-4 py-3 text-left hidden lg:table-cell">Comunidad</th>
                        <th className="px-4 py-3 text-left">Total</th>
                        <th className="px-4 py-3 text-left hidden sm:table-cell">Completadas</th>
                        <th className="px-4 py-3 text-left hidden sm:table-cell">Pendientes</th>
                        <th className="px-4 py-3 text-left hidden sm:table-cell">Canceladas</th>
                        <th className="px-4 py-3 text-left hidden md:table-cell">Última visita</th>
                        <th className="px-4 py-3 text-left hidden lg:table-cell">Extensionistas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.visitasPorPropietario?.map((r, i) => (
                        <tr key={r.propietario_id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 font-medium">{r.propietario_nombre || '—'}</td>
                          <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{r.rut || '—'}</td>
                          <td className="px-4 py-3 hidden md:table-cell">{r.comuna || '—'}</td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {r.comunidad_indigena
                              ? <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{r.comunidad_nombre || 'Sí'}</span>
                              : <span className="text-gray-400 text-xs">No</span>
                            }
                          </td>
                          <td className="px-4 py-3 font-bold text-green-700">{r.total_visitas}</td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{r.completadas}</span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">{r.pendientes}</span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">{r.canceladas}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                            {r.ultima_visita ? new Date(r.ultima_visita).toLocaleDateString('es-CL') : '—'}
                          </td>
                          <td className="px-4 py-3 text-center hidden lg:table-cell">{r.extensionistas_distintos}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}