'use client'

import { useState, useEffect, useMemo } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useRouter } from 'next/navigation'

const ESTADO_COLOR = {
  pendiente:  'bg-yellow-100 text-yellow-700',
  completada: 'bg-green-100 text-green-700',
  cancelada:  'bg-red-100 text-red-700',
}

function formatHora(hora) {
  if (!hora || hora === '00:00:00') return '—'
  return hora
}

function Notificacion({ notificacion }) {
  if (!notificacion) return null
  const estilos = {
    success: 'bg-green-50 border-green-400 text-green-800',
    error:   'bg-red-50 border-red-400 text-red-800',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
  }
  const iconos = { success: '✓', error: '✕', warning: '⚠' }
  return (
    <div className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-[100] flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl border shadow-lg max-w-[calc(100vw-2rem)] ${estilos[notificacion.tipo]}`}>
      <span className="text-lg font-bold">{iconos[notificacion.tipo]}</span>
      <p className="text-sm font-medium">{notificacion.mensaje}</p>
    </div>
  )
}

function ModalConfirmar({ config, onConfirmar, onCancelar }) {
  if (!config) return null
  const estilos = {
    danger: { btn: 'bg-red-600 hover:bg-red-700', icono: '⚠', titulo: 'text-red-700' },
  }
  const estilo = estilos[config.tipo] || estilos.danger
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{estilo.icono}</span>
          <h3 className={`text-lg font-bold ${estilo.titulo}`}>{config.titulo}</h3>
        </div>
        <p className="text-sm text-gray-600">{config.mensaje}</p>
        <div className="flex gap-3 pt-2">
          <button onClick={onCancelar}
            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
            Cancelar
          </button>
          <button onClick={onConfirmar}
            className={`flex-1 text-white py-2 rounded-lg transition text-sm font-semibold ${estilo.btn}`}>
            {config.btnConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalEditar({ visita, onClose, onGuardar }) {
  const [form, setForm] = useState({
    fecha_visita:  visita.fecha_visita?.split('T')[0] || '',
    hora_visita:   visita.hora_visita && visita.hora_visita !== '00:00:00' ? visita.hora_visita : '',
    estado:        visita.estado || 'pendiente',
    actividad:     visita.actividad || '',
    observaciones: visita.observaciones || '',
  })

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleGuardar() {
    await onGuardar({ id: visita.id, ...form })
    onClose()
  }

  const inputClass = "border p-2 rounded w-full focus:ring-2 focus:ring-green-500 focus:outline-none text-sm text-gray-800"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl font-bold text-green-800">Modificar Visita</h2>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none shrink-0 ml-2">✕</button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Propietario</label>
            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded break-words">{visita.propietario_nombre}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Extensionista</label>
            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded break-words">{visita.extensionista_nombre}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
              <input type="date" name="fecha_visita" value={form.fecha_visita}
                onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hora</label>
              <input type="time" name="hora_visita" value={form.hora_visita}
                onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange} className={inputClass}>
              <option value="pendiente">Pendiente</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Actividad</label>
            <select name="actividad" value={form.actividad} onChange={handleChange} className={inputClass}>
              <option value="">Seleccione actividad</option>
              <option value="Inspección">Visita jornada marcación</option>
              <option value="Revisión">Visita talonario terreno</option>
              <option value="Mantenimiento">Visita regular</option>
              <option value="Capacitación">Capacitación</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Observaciones</label>
            <textarea name="observaciones" value={form.observaciones}
              onChange={handleChange} rows={3} placeholder="Observaciones"
              className={`${inputClass} placeholder-gray-400`} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t">
          <button onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium order-2 sm:order-1">
            Cancelar
          </button>
          <button onClick={handleGuardar}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-semibold order-1 sm:order-2">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VisitasTotales() {
  const router = useRouter()
  const [visitas, setVisitas]               = useState([])
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState('')
  const [visitaEditar, setVisitaEditar]     = useState(null)
  const [notificacion, setNotificacion]     = useState(null)
  const [modalConfirmar, setModalConfirmar] = useState(null)
  const [filtroExtensionista, setFiltroExtensionista] = useState('')
  const [filtroPropietario, setFiltroPropietario]     = useState('')
  const [filtroFecha, setFiltroFecha]                 = useState('')

  useEffect(() => {
    if (!notificacion) return
    const t = setTimeout(() => setNotificacion(null), 3000)
    return () => clearTimeout(t)
  }, [notificacion])

  function mostrarNotificacion(mensaje, tipo = 'success') {
    setNotificacion({ mensaje, tipo })
  }

  useEffect(() => {
    let activo = true
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/admvisitas')
        if (!res.ok) throw new Error('Error obteniendo visitas')
        const data = await res.json()
        if (activo) setVisitas(data)
      } catch (err) {
        if (activo) setError(err.message)
      } finally {
        if (activo) setLoading(false)
      }
    }
    cargar()
    return () => { activo = false }
  }, [])

  const visitasFiltradas = useMemo(() => {
    return visitas.filter(v => {
      return (
        (filtroExtensionista === '' || v.extensionista_nombre.toLowerCase().includes(filtroExtensionista.toLowerCase())) &&
        (filtroPropietario === '' || v.propietario_nombre.toLowerCase().includes(filtroPropietario.toLowerCase())) &&
        (filtroFecha === '' || new Date(v.fecha_visita).toLocaleDateString() === new Date(filtroFecha).toLocaleDateString())
      )
    })
  }, [visitas, filtroExtensionista, filtroPropietario, filtroFecha])

  async function handleGuardar(datos) {
    try {
      const res = await fetch('/api/admvisitas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      })
      if (!res.ok) throw new Error('Error al modificar la visita')
      setVisitas(prev => prev.map(v => v.id === datos.id ? { ...v, ...datos } : v))
      mostrarNotificacion('Visita modificada correctamente', 'success')
    } catch (error) {
      mostrarNotificacion('Error: ' + error.message, 'error')
    }
  }

  function confirmarEliminar(id) {
    setModalConfirmar({
      titulo:       '¿Eliminar visita?',
      mensaje:      'Esta acción no se puede deshacer. ¿Estás seguro de eliminar esta visita?',
      btnConfirmar: 'Sí, eliminar',
      tipo:         'danger',
      accion:       async () => {
        try {
          const res = await fetch('/api/admvisitas', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          })
          if (!res.ok) throw new Error('Error al eliminar la visita')
          setVisitas(prev => prev.filter(v => v.id !== id))
          mostrarNotificacion('Visita eliminada correctamente', 'warning')
        } catch (error) {
          mostrarNotificacion('Error: ' + error.message, 'error')
        }
      }
    })
  }

  async function ejecutarConfirmacion() {
    const accion = modalConfirmar?.accion
    setModalConfirmar(null)
    if (accion) await accion()
  }

  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Listado de Visitas Totales', 14, 22)
    const headers = [['Extensionista', 'Propietario', 'Fecha', 'Hora', 'Estado', 'Comunidad']]
    const data = visitasFiltradas.map(v => [
      v.extensionista_nombre,
      v.propietario_nombre,
      new Date(v.fecha_visita).toLocaleDateString('es-CL'),
      formatHora(v.hora_visita),
      v.estado.charAt(0).toUpperCase() + v.estado.slice(1),
      v.comunidad_indigena ? (v.comunidad_nombre || 'Indígena') : 'No'
    ])
    autoTable(doc, {
      startY: 30, head: headers, body: data,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [16, 185, 129] },
      theme: 'striped',
    })
    doc.save('visitas.pdf')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen px-4">
      <p className="text-lg text-green-700 animate-pulse text-center">Cargando visitas...</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-screen px-4">
      <p className="text-red-600 text-lg text-center">Error: {error}</p>
    </div>
  )

  const filtroClass = "w-full p-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400"

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto p-4 sm:p-6 overflow-x-hidden">

      <Notificacion notificacion={notificacion} />
      <ModalConfirmar
        config={modalConfirmar}
        onConfirmar={ejecutarConfirmacion}
        onCancelar={() => setModalConfirmar(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-800">Visitas Totales</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button onClick={() => router.back()}
            className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg font-semibold transition whitespace-nowrap">
            ← Volver
          </button>
          <button onClick={exportarPDF}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition whitespace-nowrap">
            Exportar a PDF
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <input type="text" placeholder="Filtrar por Extensionista"
          value={filtroExtensionista} onChange={e => setFiltroExtensionista(e.target.value)}
          className={filtroClass} />
        <input type="text" placeholder="Filtrar por Propietario"
          value={filtroPropietario} onChange={e => setFiltroPropietario(e.target.value)}
          className={filtroClass} />
        <input type="date" value={filtroFecha}
          onChange={e => setFiltroFecha(e.target.value)}
          className={filtroClass} />
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Mostrando <span className="font-semibold text-green-700">{visitasFiltradas.length}</span> de{' '}
        <span className="font-semibold text-gray-800">{visitas.length}</span> visitas
      </p>

      <div className="w-full max-w-full overflow-x-auto border border-green-200 rounded-lg shadow-md">
        <table className="min-w-[640px] w-full table-auto border-collapse">
          <thead className="bg-green-50">
            <tr>
              <th className="border border-green-200 px-3 sm:px-4 py-3 text-left text-sm font-semibold text-green-700 uppercase whitespace-nowrap">Extensionista</th>
              <th className="border border-green-200 px-3 sm:px-4 py-3 text-left text-sm font-semibold text-green-700 uppercase whitespace-nowrap">Propietario</th>
              <th className="border border-green-200 px-3 sm:px-4 py-3 text-left text-sm font-semibold text-green-700 uppercase whitespace-nowrap">Fecha</th>
              <th className="border border-green-200 px-3 sm:px-4 py-3 text-left text-sm font-semibold text-green-700 uppercase whitespace-nowrap">Hora</th>
              <th className="border border-green-200 px-3 sm:px-4 py-3 text-left text-sm font-semibold text-green-700 uppercase whitespace-nowrap">Estado</th>
              <th className="border border-green-200 px-3 sm:px-4 py-3 text-left text-sm font-semibold text-green-700 uppercase whitespace-nowrap">Comunidad</th>
              <th className="border border-green-200 px-3 sm:px-4 py-3 text-left text-sm font-semibold text-green-700 uppercase whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visitasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-600 font-semibold">
                  No hay visitas para mostrar.
                </td>
              </tr>
            ) : (
              visitasFiltradas.map(visita => (
                <tr key={visita.id} className="hover:bg-green-50 transition-colors">
                  <td className="border border-green-200 px-3 sm:px-4 py-3 text-sm text-gray-800 whitespace-nowrap">{visita.extensionista_nombre}</td>
                  <td className="border border-green-200 px-3 sm:px-4 py-3 text-sm text-gray-800 whitespace-nowrap">{visita.propietario_nombre}</td>
                  <td className="border border-green-200 px-3 sm:px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                    {new Date(visita.fecha_visita).toLocaleDateString('es-CL')}
                  </td>
                  <td className="border border-green-200 px-3 sm:px-4 py-3 text-sm text-gray-800 whitespace-nowrap">{formatHora(visita.hora_visita)}</td>
                  <td className="border border-green-200 px-3 sm:px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold capitalize whitespace-nowrap ${ESTADO_COLOR[visita.estado] || 'bg-gray-100 text-gray-600'}`}>
                      {visita.estado}
                    </span>
                  </td>
                  <td className="border border-green-200 px-3 sm:px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                    {visita.comunidad_indigena ? visita.comunidad_nombre || 'Indígena' : 'No'}
                  </td>
                  <td className="border border-green-200 px-3 sm:px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => setVisitaEditar(visita)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs font-medium transition whitespace-nowrap">
                        Modificar
                      </button>
                      <button onClick={() => confirmarEliminar(visita.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs font-medium transition whitespace-nowrap">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {visitaEditar && (
        <ModalEditar
          visita={visitaEditar}
          onClose={() => setVisitaEditar(null)}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  )
}