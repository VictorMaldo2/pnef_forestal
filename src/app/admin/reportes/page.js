'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { jsPDF } from 'jspdf'

export default function ExtensionistaDashboard() {
  const router = useRouter()
  const [busqueda, setBusqueda] = useState('')

  // Datos ficticios para propietarios
  const propietarios = useMemo(() => [
    {
      id: 1,
      nombre: 'Juan Pérez',
      rut: '12345678-9',
      comunidad_indigena: 'Mapuche',
      genero: 'Masculino',
      comuna: 'Temuco',
      tipo_propietario: 'Pequeño',
      visitas_pendientes: 2,
    },
    {
      id: 2,
      nombre: 'María González',
      rut: '98765432-1',
      comunidad_indigena: 'Aymara',
      genero: 'Femenino',
      comuna: 'Calama',
      tipo_propietario: 'Mediano',
      visitas_pendientes: 0,
    },
  ], [])

  const visitasPendientesCount = 5
  const jornadasCompletadasCount = 12
  const proximasVisitas = [
    { nombre: 'Juan Pérez', fecha: '15 Jun' },
    { nombre: 'María González', fecha: '20 Jun' },
  ]

  const propietariosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase()
    return propietarios.filter(
      p =>
        p.nombre.toLowerCase().includes(q) || p.rut.includes(busqueda)
    )
  }, [busqueda, propietarios])

  // Función para exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('Listado de Propietarios', 10, 20)

    let y = 30
    propietariosFiltrados.forEach((p, i) => {
      if (y > 280) {
        doc.addPage()
        y = 20
      }
      doc.setFontSize(14)
      doc.text(`${i + 1}. ${p.nombre} | RUT: ${p.rut}`, 10, y)
      doc.setFontSize(12)
      doc.text(`Comunidad: ${p.comunidad_indigena || 'N/A'}, Género: ${p.genero || 'N/A'}`, 10, y + 6)
      doc.text(`Comuna: ${p.comuna || 'N/A'}, Tipo: ${p.tipo_propietario || 'N/A'}`, 10, y + 12)
      doc.text(`Visitas pendientes: ${p.visitas_pendientes}`, 10, y + 18)
      y += 28
    })

    doc.save('propietarios_pnef.pdf')
  }

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-800">Panel Administrativo</h1>
            <p className="text-green-600">Gestión de propietarios</p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="bg-green-600 text-white rounded px-5 py-2 hover:bg-green-700 transition"
          >
            volver
          </button>
        </div>

        {/* Indicadores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow border border-green-100 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Propietarios</h3>
            <p className="text-4xl font-bold text-green-600">{propietarios.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-yellow-100 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Visitas Pendientes</h3>
            <p className="text-4xl font-bold text-yellow-600">{visitasPendientesCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-blue-100 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Jornadas Completadas</h3>
            <p className="text-4xl font-bold text-blue-600">{jornadasCompletadasCount}</p>
          </div>
        </div>

        {/* Buscador */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Buscar propietario por nombre o RUT..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full p-4 pl-12 border border-green-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-400 shadow-sm"
          />
        </div>

        {/* Botón para exportar PDF */}
        <button
          onClick={exportarPDF}
          className="mb-6 bg-green-700 text-white py-3 px-6 rounded hover:bg-green-800 transition"
        >
          📄 Exportar listado a PDF
        </button>

        {/* Tabla Propietarios */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-green-100">
            <h2 className="text-2xl font-semibold text-green-800">
              Propietarios ({propietariosFiltrados.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-green-50">
                <tr>
                  <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">
                    Nombre
                  </th>
                  <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">
                    RUT
                  </th>
                  <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">
                    Comunidad Indígena
                  </th>
                  <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">
                    Comuna
                  </th>
                  <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">
                    Tipo Propietario
                  </th>
                  <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">
                    Visitas Pendientes
                  </th>
                </tr>
              </thead>
              <tbody>
                {propietariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-6 text-gray-500">
                      No se encontraron propietarios.
                    </td>
                  </tr>
                ) : (
                  propietariosFiltrados.map(propietario => (
                    <tr
                      key={propietario.id}
                      className="hover:bg-green-50 transition-colors"
                    >
                      <td className="border p-4 font-medium text-gray-900">
                        {propietario.nombre}
                      </td>
                      <td className="border p-4 text-gray-700">
                        {propietario.rut}
                      </td>
                      <td className="border p-4">
                        {propietario.comunidad_indigena ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {propietario.comunidad_indigena}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                            No
                          </span>
                        )}
                      </td>
                      <td className="border p-4 text-gray-700">{propietario.comuna}</td>
                      <td className="border p-4 text-gray-700">
                        {propietario.tipo_propietario}
                      </td>
                      <td className="border p-4">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                          {propietario.visitas_pendientes}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Próximas Visitas y Acciones Rápidas pueden ir aquí */}
      </div>
    </div>
  )
}