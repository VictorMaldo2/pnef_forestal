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
            <th className="py-2 px-3 w-40"></th>
          </tr>
        </thead>
        <tbody>
          {actividades.map((a, i) => {
            const pct = totalJornadas > 0 ? Math.round((a.total / totalJornadas) * 100) : 0
            const barPct = Math.round((a.total / max) * 100)
            return (
              <tr key={a.value} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className={`py-2 px-3 ${a.total === 0 ? 'text-gray-300' : 'text-gray-700'}`}>
                  {a.label}
                </td>
                <td className={`py-2 px-3 text-right font-bold ${a.total === 0 ? 'text-gray-300' : 'text-green-700'}`}>
                  {a.total}
                </td>
                <td className={`py-2 px-3 text-right text-xs ${a.total === 0 ? 'text-gray-300' : 'text-gray-500'}`}>
                  {pct}%
                </td>
                <td className="py-2 px-3">
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
    <div className="flex items-end gap-2 h-32 pt-2">
      {datos.map(d => {
        const total = (d.talonarios || 0) + (d.marcaciones || 0)
        const hT = Math.round((d.talonarios / maxVal) * 100)
        const hM = Math.round((d.marcaciones / maxVal) * 100)
        return (
          <div key={d.mes} className="flex-1 flex flex-col items-center gap-1">
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

export default function ReportesPage() {
  const router     = useRouter()
  const reporteRef = useRef(null)

  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [exportando, setExportando] = useState(false)
  const [desde, setDesde]       = useState('')
  const [hasta, setHasta]       = useState('')
  const [extensionista, setExtensionista] = useState('')
  const [comuna, setComuna]     = useState('')
  const [propietario, setPropietario]   = useState('')
  const [comunidad, setComunidad]       = useState('')

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
  }, [desde, hasta, extensionista, comuna, propietario, comunidad])

  function limpiar() {
    setDesde(''); setHasta(''); setExtensionista('')
    setComuna(''); setPropietario(''); setComunidad('')
  }

  async function exportarPDF() {
    if (!data || !reporteRef.current) return
    setExportando(true)
    try {
      const html2canvas = (await import('html2canvas-pro')).default
      const { jsPDF }   = await import('jspdf')

      const canvas = await html2canvas(reporteRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
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
      alert('Error al exportar: ' + e.message)
    } finally {
      setExportando(false)
    }
  }

  const kpis      = data?.kpis
  const maxComuna = Math.max(...(data?.porComuna?.map(r => r.jornadas) || [0]))
  const maxExt    = Math.max(...(data?.porExtensionista?.map(r => r.jornadas) || [0]))
  const maxAct    = Math.max(...(data?.actividades?.map(r => r.total) || [0]))
  const maxActV   = Math.max(...(data?.actividadesVisitas?.map(r => r.total) || [0]))
  const pctEjec   = kpis?.sup_planificada > 0
    ? Math.round((kpis.sup_ejecutada / kpis.sup_planificada) * 100) : 0

  const inputClass = "border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full"

  return (
    <div className="bg-white">

      {/* Botones fuera del ref para que no salgan en el PDF */}
      <div className="max-w-7xl mx-auto px-6 pt-6 flex items-center justify-between">
        <div>
          <button onClick={() => router.push('/admin')}
            className="text-green-700 hover:text-green-900 text-sm font-medium mb-2 flex items-center gap-1">
            ← Volver al Dashboard
          </button>
          <h1 className="text-3xl font-bold text-green-800">Reportes</h1>
          <p className="text-gray-500 text-sm">Jornadas de terreno, marcación y visitas — PNEF</p>
        </div>
        <button
          onClick={exportarPDF}
          disabled={exportando || !data}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          {exportando ? '⏳ Generando PDF...' : '📄 Exportar PDF'}
        </button>
      </div>

      {/* Todo lo que va dentro del PDF */}
      <div ref={reporteRef} className="max-w-7xl mx-auto p-6 space-y-6 bg-white">

        {/* Filtros */}
        <div className="bg-gray-50 border rounded p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
              <select value={propietario} onChange={e => setPropietario(e.target.value)} className={inputClass}>
                <option value="">Todos</option>
                {data?.propietarios?.map(p => (
                  <option key={p.id} value={p.nombre}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Comunidad indígena</label>
              <select value={comunidad} onChange={e => setComunidad(e.target.value)} className={inputClass}>
                <option value="">Todas</option>
                {data?.comunidades?.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
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
            {/* ── Jornadas ────────────────────────────────────────────────── */}
            <h2 className="text-xl font-bold text-green-800">Jornadas de terreno</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <KpiCard label="Total jornadas"      value={fmt(kpis?.total)} />
              <KpiCard label="Talonarios"          value={fmt(kpis?.talonarios)} />
              <KpiCard label="Marcaciones"         value={fmt(kpis?.marcaciones)} />
              <KpiCard label="Propietarios"        value={fmt(kpis?.propietarios)} />
              <KpiCard label="Sup. total (Ha)"     value={fmt(kpis?.sup_total)} />
              <KpiCard label="Sup. ejecutada (Ha)" value={fmt(kpis?.sup_ejecutada)}
                sub={kpis?.sup_planificada ? `de ${fmt(kpis.sup_planificada)} Ha planificadas` : ''} />
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <BarraHorizontal key={a.actividad} label={a.actividad} valor={a.total} max={maxAct} />
                ))}
              </div>
            </div>

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
                      <th className="px-4 py-3 text-left">Propietarios</th>
                      <th className="px-4 py-3 text-left">Sup. total (Ha)</th>
                      <th className="px-4 py-3 text-left">Participación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.porExtensionista?.map((r, i) => (
                      <tr key={r.extensionista_nombre} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 font-medium">{r.extensionista_nombre || '—'}</td>
                        <td className="px-4 py-3">{fmt(r.jornadas)}</td>
                        <td className="px-4 py-3">{fmt(r.propietarios)}</td>
                        <td className="px-4 py-3">{fmt(r.sup_total)}</td>
                        <td className="px-4 py-3 w-40">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border rounded p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Cobertura por comuna</p>
                {data?.porComuna?.map(r => (
                  <BarraHorizontal key={r.comuna} label={r.comuna || '—'}
                    valor={r.jornadas} max={maxComuna} sufijo=' jornadas' />
                ))}
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

            {/* ── Actividades completas ──────────────────────────────────── */}
            <div className="border-t pt-6 space-y-4">
              <h2 className="text-xl font-bold text-green-800">Detalle de actividades</h2>
              <p className="text-sm text-gray-500">
                Todas las actividades posibles y cuántas veces fueron realizadas en el período.
                Las actividades en gris no tienen registros.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* ── Visitas ───────────────────────────────────────────────── */}
            <div className="border-t pt-6 space-y-6">
              <h2 className="text-xl font-bold text-green-800">Visitas a propietarios</h2>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <KpiCard label="Total visitas"          value={fmt(data?.kpiVisitas?.total)} />
                <KpiCard label="Completadas"            value={fmt(data?.kpiVisitas?.completadas)} />
                <KpiCard label="Pendientes"             value={fmt(data?.kpiVisitas?.pendientes)} />
                <KpiCard label="Canceladas"             value={fmt(data?.kpiVisitas?.canceladas)} />
                <KpiCard label="Propietarios visitados" value={fmt(data?.kpiVisitas?.propietarios_con_visita)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border rounded p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Visitas por extensionista</p>
                  {data?.visitasPorExtensionista?.map((r, i) => (
                    <div key={r.extensionista_nombre}
                      className={`flex justify-between items-center py-2 border-b border-gray-50 last:border-0 text-sm ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                      <span className="text-gray-700 font-medium w-36 truncate shrink-0">
                        {r.extensionista_nombre || '—'}
                      </span>
                      <div className="flex gap-2 text-xs">
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
                        <BarraHorizontal key={a.actividad} label={a.actividad} valor={a.total} max={maxActV} />
                      ))
                    : <p className="text-sm text-gray-400">Sin datos</p>
                  }
                </div>
              </div>

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
                        <th className="px-4 py-3 text-left">RUT</th>
                        <th className="px-4 py-3 text-left">Comuna</th>
                        <th className="px-4 py-3 text-left">Comunidad</th>
                        <th className="px-4 py-3 text-left">Total</th>
                        <th className="px-4 py-3 text-left">Completadas</th>
                        <th className="px-4 py-3 text-left">Pendientes</th>
                        <th className="px-4 py-3 text-left">Canceladas</th>
                        <th className="px-4 py-3 text-left">Última visita</th>
                        <th className="px-4 py-3 text-left">Extensionistas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.visitasPorPropietario?.map((r, i) => (
                        <tr key={r.propietario_id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 font-medium">{r.propietario_nombre || '—'}</td>
                          <td className="px-4 py-3 text-gray-500">{r.rut || '—'}</td>
                          <td className="px-4 py-3">{r.comuna || '—'}</td>
                          <td className="px-4 py-3">
                            {r.comunidad_indigena
                              ? <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                                  {r.comunidad_nombre || 'Sí'}
                                </span>
                              : <span className="text-gray-400 text-xs">No</span>
                            }
                          </td>
                          <td className="px-4 py-3 font-bold text-green-700">{r.total_visitas}</td>
                          <td className="px-4 py-3">
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                              {r.completadas}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
                              {r.pendientes}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">
                              {r.canceladas}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {r.ultima_visita
                              ? new Date(r.ultima_visita).toLocaleDateString('es-CL')
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-center">{r.extensionistas_distintos}</td>
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