'use client'

import { useState, useEffect, useRef } from 'react'

export default function SelectorPredio({ propietarioId, value, onChange }) {
  const [predios, setPredios]         = useState([])
  const [loading, setLoading]         = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nuevoPredio, setNuevoPredio] = useState({
    nombre: '', rol: '', comuna: '', superficie_total: ''
  })
  const [guardando, setGuardando]   = useState(false)
  const onChangeRef                 = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    let cancelado = false

    async function cargarPredios() {
      if (!propietarioId) {
        setPredios([])
        onChangeRef.current(null)
        return
      }
      setLoading(true)
      try {
        const res  = await fetch(`/api/predios?propietario_id=${propietarioId}`)
        const data = await res.json()
        if (!cancelado) {
          setPredios(data)
          onChangeRef.current(null)
        }
      } catch {
        if (!cancelado) setPredios([])
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    cargarPredios()
    return () => { cancelado = true }
  }, [propietarioId])

  async function handleCrearPredio() {
    if (!nuevoPredio.nombre) return alert('El nombre del predio es obligatorio')
    setGuardando(true)
    try {
      const res = await fetch('/api/predios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propietario_id: propietarioId, ...nuevoPredio })
      })
      if (!res.ok) throw new Error('Error al crear predio')
      const creado = await res.json()
      setPredios(prev => [...prev, creado])
      onChange(creado.id)
      setMostrarForm(false)
      setNuevoPredio({ nombre: '', rol: '', comuna: '', superficie_total: '' })
    } catch (e) {
      alert(e.message)
    } finally {
      setGuardando(false)
    }
  }

  if (!propietarioId) return null

  return (
    <div className="space-y-3">
      <div>
        <label className="block font-semibold mb-1 text-black text-gray-700">Predio</label>
        {loading ? (
          <p className="text-sm text-gray-700">Cargando predios...</p>
        ) : (
          <select
            value={value || ''}
            onChange={e => onChange(e.target.value || null)}
            className="border p-3 rounded w-full focus:outline-none text-black focus:ring-2 focus:ring-green-500">
            <option value="">Seleccione un predio</option>
            {predios.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre}{p.rol ? ` — ROL: ${p.rol}` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      {!mostrarForm && (
        <button type="button" onClick={() => setMostrarForm(true)}
          className="text-sm text-green-700 hover:text-green-900 font-medium underline">
          + Agregar nuevo predio
        </button>
      )}

      {mostrarForm && (
        <div className="bg-green-50 border border-green-200 rounded p-4 space-y-3">
          <p className="text-sm font-semibold text-green-800">Nuevo predio</p>
          <input type="text" placeholder="Nombre del predio *"
            value={nuevoPredio.nombre}
            onChange={e => setNuevoPredio(prev => ({ ...prev, nombre: e.target.value }))}
            className="border p-2 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input type="text" placeholder="ROL"
            value={nuevoPredio.rol}
            onChange={e => setNuevoPredio(prev => ({ ...prev, rol: e.target.value }))}
            className="border p-2 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input type="text" placeholder="Comuna"
            value={nuevoPredio.comuna}
            onChange={e => setNuevoPredio(prev => ({ ...prev, comuna: e.target.value }))}
            className="border p-2 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input type="number" step="0.01" placeholder="Superficie total (Ha)"
            value={nuevoPredio.superficie_total}
            onChange={e => setNuevoPredio(prev => ({ ...prev, superficie_total: e.target.value }))}
            className="border p-2 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-green-500" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setMostrarForm(false)}
              className="flex-1 border border-gray-300 text-gray-600 py-2 rounded text-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button type="button" onClick={handleCrearPredio} disabled={guardando}
              className="flex-1 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50">
              {guardando ? 'Guardando...' : 'Guardar predio'}
            </button>
          </div>
        </div>
      )}

      {value && predios.find(p => p.id.toString() === value.toString()) && (
        <div className="bg-green-50 p-3 rounded text-black grid grid-cols-2 gap-2">
          {(() => {
            const p = predios.find(p => p.id.toString() === value.toString())
            return (
              <>
                <div><span className="font-semibold text-black">Nombre:</span> {p.nombre}</div>
                <div><span className="font-semibold text-black">ROL:</span> {p.rol || '—'}</div>
                <div><span className="font-semibold text-black">Comuna:</span> {p.comuna || '—'}</div>
                <div><span className="font-semibold text-black">Superficie:</span> {p.superficie_total ? `${p.superficie_total} Ha` : '—'}</div>
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}