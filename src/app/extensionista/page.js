"use client"

import { useState } from "react"
import dynamic from "next/dynamic"

// Importar calendario con carga dinámica para evitar problemas en SSR
const Calendar = dynamic(() => import("@mantine/dates").then(mod => mod.Calendar), { ssr: false })

export default function VisitasPage() {
  // Datos ficticios propietarios
  const propietariosMock = [
    { id: 1, rut: "12345678-9", nombre: "Juan Pérez", etnia: "Mapuche", genero: "Masculino", comuna: "Temuco", tipo_propietario: "Pequeño" },
    { id: 2, rut: "98765432-1", nombre: "María González", etnia: "Aymara", genero: "Femenino", comuna: "Calama", tipo_propietario: "Mediano" },
    { id: 3, rut: "11122333-4", nombre: "Carlos López", etnia: "Quechua", genero: "Masculino", comuna: "Arica", tipo_propietario: "Grande" }
  ]

  // Datos ficticios visitas agendadas
  const visitasMock = [
    { id: 1, propietario: propietariosMock[0], fecha_visita: new Date("2024-06-15T10:00:00"), descripcion: "Revisión de hectáreas", estado: "Pendiente" },
    { id: 2, propietario: propietariosMock[1], fecha_visita: new Date("2024-06-20T14:00:00"), descripcion: "Entrevista inicial", estado: "Confirmada" }
  ]

  const [visitas, setVisitas] = useState(visitasMock)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedPropietarioId, setSelectedPropietarioId] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [error, setError] = useState("")

  function resetForm() {
    setSelectedDate(new Date())
    setSelectedPropietarioId("")
    setDescripcion("")
    setError("")
  }

  // Función para agendar visita (simulada)
  function agendarVisita(e) {
    e.preventDefault()
    setError("")
    if (!selectedPropietarioId) {
      setError("Seleccione un propietario")
      return
    }

    const propietarioSeleccionado = propietariosMock.find(p => p.id === parseInt(selectedPropietarioId))
    if (!propietarioSeleccionado) {
      setError("Propietario inválido")
      return
    }

    const nuevaVisita = {
      id: visitas.length + 1,
      propietario: propietarioSeleccionado,
      fecha_visita: selectedDate,
      descripcion,
      estado: "Pendiente"
    }

    setVisitas([...visitas, nuevaVisita])
    resetForm()
  }

  return (
    <div className="p-8 max-w-5xl mx-auto bg-white rounded shadow min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Agendar Visitas a Propietarios</h1>

      <form onSubmit={agendarVisita} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block mb-2 font-semibold">Fecha de visita</label>
          <Calendar value={selectedDate} onChange={setSelectedDate} />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Propietario</label>
          <select
            value={selectedPropietarioId}
            onChange={e => setSelectedPropietarioId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">-- Seleccione un propietario --</option>
            {propietariosMock.map(p => (
              <option key={p.id} value={p.id}>{`${p.nombre} (${p.rut})`}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold">Descripción</label>
          <input
            type="text"
            placeholder="Descripción de la visita"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {error && <div className="text-red-600 col-span-3">{error}</div>}

        <button type="submit" className="bg-blue-600 text-white py-3 rounded col-span-3 hover:bg-blue-700">
          Agendar Visita
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-4">Visitas Agendadas</h2>
      <div className="overflow-auto border border-gray-300 rounded">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Propietario</th>
              <th className="border p-3 text-left">Rut</th>
              <th className="border p-3 text-left">Fecha</th>
              <th className="border p-3 text-left">Descripción</th>
              <th className="border p-3 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {visitas.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">
                  No hay visitas agendadas.
                </td>
              </tr>
            ) : (
              visitas.map(visita => (
                <tr key={visita.id} className="hover:bg-gray-50">
                  <td className="border p-3">{visita.propietario.nombre}</td>
                  <td className="border p-3">{visita.propietario.rut}</td>
                  <td className="border p-3">{visita.fecha_visita.toLocaleDateString()}</td>
                  <td className="border p-3">{visita.descripcion}</td>
                  <td className="border p-3">{visita.estado}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}