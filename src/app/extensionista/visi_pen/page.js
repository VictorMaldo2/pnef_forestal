'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function Notificacion({ notificacion }) {
  if (!notificacion) return null
  const estilos = {
    success: 'bg-green-50 border-green-400 text-green-800',
    error:   'bg-red-50 border-red-400 text-red-800',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
  }
  const iconos = { success: '✓', error: '✕', warning: '⚠' }
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl border shadow-lg transition-all duration-300 ${estilos[notificacion.tipo]}`}>
      <span className="text-lg font-bold">{iconos[notificacion.tipo]}</span>
      <p className="text-sm font-medium">{notificacion.mensaje}</p>
    </div>
  )
}

function ModalConfirmar({ config, onConfirmar, onCancelar }) {
  if (!config) return null
  const estilos = {
    danger:  { btn: 'bg-red-600 hover:bg-red-700',    icono: '⚠', titulo: 'text-red-700' },
    success: { btn: 'bg-green-600 hover:bg-green-700', icono: '✓', titulo: 'text-green-700' },
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

function ModalEditar({ visita, onClose, onGuardar, esAdmin }) {
  const [form, setForm] = useState({
    fecha_visita:  visita.fecha_visita?.split('T')[0] || '',
    hora_visita:   visita.hora_visita && visita.hora_visita !== '00:00:00' ? visita.hora_visita : '',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-green-800">Modificar Visita</h2>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Propietario</label>
            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{visita.propietario_nombre}</p>
          </div>
          {esAdmin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Extensionista</label>
              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{visita.extensionista_nombre}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
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
        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
            Cancelar
          </button>
          <button onClick={handleGuardar}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-semibold">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}

function formatHora(hora) {
  if (!hora || hora === '00:00:00') return '—'
  return hora
}

export default function VisitasPendientes() {
  const { data: session }               = useSession()
  const router                          = useRouter()
  const esAdmin                         = session?.user?.roleId === 1
  const [visitas, setVisitas]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [visitaEditar, setVisitaEditar] = useState(null)
  const [notificacion, setNotificacion] = useState(null)
  const [modalConfirmar, setModalConfirmar] = useState(null)
  const [filterExtensionista, setFilterExtensionista] = useState('')
  const [filterPropietario, setFilterPropietario]     = useState('')
  const [filterFecha, setFilterFecha]                 = useState('')

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
        const res = await fetch('/api/visPendientes')
        if (!res.ok) throw new Error('Error al cargar visitas')
        const data = await res.json()
        if (activo) setVisitas(data)
      } catch (err) {
        if (activo) setError('Error al cargar visitas: ' + err.message)
      } finally {
        if (activo) setLoading(false)
      }
    }
    cargar()
    return () => { activo = false }
  }, [])

  const visitasFiltradas = useMemo(() => {
    return visitas.filter(v => {
      const coincideExt = !esAdmin ||
        (v.extensionista_nombre || '').toLowerCase().includes(filterExtensionista.toLowerCase())
      const coincideProp =
        (v.propietario_nombre || '').toLowerCase().includes(filterPropietario.toLowerCase())
      const coincideFecha =
        filterFecha === '' ||
        new Date(v.fecha_visita).toLocaleDateString() === new Date(filterFecha).toLocaleDateString()
      return coincideExt && coincideProp && coincideFecha
    })
  }, [visitas, filterExtensionista, filterPropietario, filterFecha, esAdmin])

  async function handleGuardar(datos) {
    try {
      const res = await fetch('/api/visPendientes', {
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

  function confirmarCancelar(id) {
    setModalConfirmar({
      titulo: '¿Cancelar visita?',
      mensaje: 'Esta acción marcará la visita como cancelada. ¿Estás seguro?',
      btnConfirmar: 'Sí, cancelar',
      tipo: 'danger',
      accion: async () => {
        try {
          const res = await fetch('/api/visPendientes', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          })
          if (!res.ok) throw new Error('Error al cancelar la visita')
          setVisitas(prev => prev.filter(v => v.id !== id))
          mostrarNotificacion('Visita cancelada correctamente', 'warning')
        } catch (error) {
          mostrarNotificacion('Error: ' + error.message, 'error')
        }
      }
    })
  }

  function confirmarCompletar(id) {
    setModalConfirmar({
      titulo: '¿Marcar como completada?',
      mensaje: 'Se registrará esta visita como completada y desaparecerá de la lista.',
      btnConfirmar: 'Sí, completar',
      tipo: 'success',
      accion: async () => {
        try {
          const res = await fetch('/api/updVisitas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          })
          if (!res.ok) throw new Error('Error al actualizar la visita')
          setVisitas(prev => prev.filter(v => v.id !== id))
          mostrarNotificacion('Visita marcada como completada', 'success')
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
    doc.text('Listado de Visitas Pendientes', 14, 22)
    const headers = esAdmin
      ? [['Extensionista', 'Propietario', 'Fecha', 'Hora', 'Actividad', 'Comunidad']]
      : [['Propietario', 'Fecha', 'Hora', 'Actividad', 'Comunidad']]
    const data = visitasFiltradas.map(v => esAdmin
      ? [v.extensionista_nombre, v.propietario_nombre, new Date(v.fecha_visita).toLocaleDateString('es-CL'), formatHora(v.hora_visita), v.actividad || '—', v.comunidad_indigena ? (v.comunidad_nombre || 'Indígena') : 'No']
      : [v.propietario_nombre, new Date(v.fecha_visita).toLocaleDateString('es-CL'), formatHora(v.hora_visita), v.actividad || '—', v.comunidad_indigena ? (v.comunidad_nombre || 'Indígena') : 'No']
    )
    autoTable(doc, { startY: 30, head: headers, body: data, styles: { fontSize: 10 }, headStyles: { fillColor: [16, 185, 129] }, theme: 'striped' })
    doc.save('visitas_pendientes.pdf')
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
      <p className="text-xl text-green-600 animate-pulse">Cargando visitas pendientes...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
      <p className="text-red-600">{error}</p>
    </div>
  )

  const columnas = esAdmin
    ? ['Extensionista', 'Propietario', 'Fecha', 'Hora', 'Actividad', 'Comunidad', 'Acciones']
    : ['Propietario', 'Fecha', 'Hora', 'Actividad', 'Comunidad', 'Acciones']

  const filtroClass = "p-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400"

  return (
    <div className="p-4 max-w-7xl mx-auto">

      <Notificacion notificacion={notificacion} />
      <ModalConfirmar
        config={modalConfirmar}
        onConfirmar={ejecutarConfirmacion}
        onCancelar={() => setModalConfirmar(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <button onClick={() => router.push('/extensionista')}
            className="text-green-700 hover:text-green-900 text-sm font-medium mb-2 flex items-center gap-1">
            ← Volver
          </button>
          <h1 className="text-3xl font-bold text-green-800">Visitas Pendientes</h1>
        </div>
        <button onClick={exportarPDF}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition">
          Exportar a PDF
        </button>
      </div>

      <div className={`mb-6 grid grid-cols-1 gap-4 ${esAdmin ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {esAdmin && (
          <input type="text" placeholder="Filtrar por Extensionista"
            value={filterExtensionista} onChange={e => setFilterExtensionista(e.target.value)}
            className={filtroClass} />
        )}
        <input type="text" placeholder="Filtrar por Propietario"
          value={filterPropietario} onChange={e => setFilterPropietario(e.target.value)}
          className={filtroClass} />
        <input type="date" value={filterFecha}
          onChange={e => setFilterFecha(e.target.value)}
          className={filtroClass} />
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Mostrando <span className="font-semibold text-green-700">{visitasFiltradas.length}</span> visitas pendientes
      </p>

      <div className="overflow-x-auto border border-green-200 rounded-lg shadow-md">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-green-50">
            <tr>
              {columnas.map(h => (
                <th key={h}
                  className="border border-green-200 px-4 py-3 text-left text-sm font-semibold text-green-700 uppercase whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visitasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={columnas.length} className="py-8 text-center text-gray-600 font-semibold">
                  No hay visitas pendientes.
                </td>
              </tr>
            ) : (
              visitasFiltradas.map(visita => (
                <tr key={visita.id} className="hover:bg-green-50 transition-colors">
                  {esAdmin && (
                    <td className="border border-green-200 px-4 py-3 text-sm text-gray-800">{visita.extensionista_nombre}</td>
                  )}
                  <td className="border border-green-200 px-4 py-3 text-sm text-gray-800">{visita.propietario_nombre}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                    {new Date(visita.fecha_visita).toLocaleDateString('es-CL')}
                  </td>
                  <td className="border border-green-200 px-4 py-3 text-sm text-gray-800">{formatHora(visita.hora_visita)}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm text-gray-800">{visita.actividad || '—'}</td>
                  <td className="border border-green-200 px-4 py-3 text-sm text-gray-800">
                    {visita.comunidad_indigena ? visita.comunidad_nombre || 'Indígena' : 'No'}
                  </td>
                  <td className="border border-green-200 px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setVisitaEditar(visita)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs font-medium transition">
                        Modificar
                      </button>
                      <button onClick={() => confirmarCancelar(visita.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs font-medium transition">
                        Cancelar
                      </button>
                      <button onClick={() => confirmarCompletar(visita.id)}
                        className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 text-xs font-medium transition">
                        Completada
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
          esAdmin={esAdmin}
        />
      )}
    </div>
  )
}