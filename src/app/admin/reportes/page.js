"use client"

import { useState, useRef } from 'react'
import jsPDF from 'jspdf'

export default function AdminReportesPage() {
  // Datos simulados de reportes
  const reportesMock = [
    { id: 1, titulo: "Reporte de jornadas junio 2024", fecha: "2024-06-30", estado: "Completado", predios: 15, extensionista: "Juan Pérez" },
    { id: 2, titulo: "Reporte de talonarios mayo 2024", fecha: "2024-05-25", estado: "Pendiente", predios: 8, extensionista: "María González" },
    { id: 3, titulo: "Reporte de productos forestales Q1", fecha: "2024-04-15", estado: "Completado", predios: 22, extensionista: "Carlos López" },
    { id: 4, titulo: "Reporte de jornadas abril 2024", fecha: "2024-04-10", estado: "Completado", predios: 12, extensionista: "Juan Pérez" },
    { id: 5, titulo: "Reporte de talonarios junio 2024", fecha: "2024-06-20", estado: "En progreso", predios: 10, extensionista: "María González" },
  ]

  const [busqueda, setBusqueda] = useState('')
  const [reportesFiltrados, setReportesFiltrados] = useState(reportesMock)

  // Función para filtrar reportes
  const filtrarReportes = (query) => {
    const filtrados = reportesMock.filter(reporte =>
      reporte.titulo.toLowerCase().includes(query.toLowerCase()) ||
      reporte.fecha.includes(query) ||
      reporte.estado.toLowerCase().includes(query.toLowerCase()) ||
      reporte.extensionista.toLowerCase().includes(query.toLowerCase())
    )
    setReportesFiltrados(filtrados)
  }

  // Función para exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF()
    
    // Título del documento
    doc.setFontSize(20)
    doc.text('Reportes Administrativos - PNEF Forestal', 20, 20)
    
    // Fecha de generación
    doc.setFontSize(12)
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-CL')}`, 20, 30)
    
    // Tabla de reportes
    let yPosition = 50
    doc.setFontSize(14)
    doc.text('Lista de Reportes:', 20, yPosition)
    yPosition += 10
    
    reportesFiltrados.forEach((reporte, index) => {
      yPosition += 10
      doc.text(`${index + 1}. ${reporte.titulo}`, 20, yPosition)
      doc.text(`Fecha: ${reporte.fecha} | Estado: ${reporte.estado} | Predios: ${reporte.predios}`, 20, yPosition + 5)
      
      // Nueva página si se acaba el espacio
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }
    })
    
    doc.save('reportes-pnef.pdf')
  }

  return (
    <main className="p-8 bg-white rounded shadow-md min-h-screen max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Reportes Administrativos</h1>
        <button
          onClick={exportarPDF}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          📄 Exportar PDF
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Buscar por título, fecha, estado o extensionista..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              filtrarReportes(e.target.value)
            }}
            className="w-full p-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Resultados */}
      <div className="mb-4 text-sm text-gray-600">
        {reportesFiltrados.length} resultado(s) encontrado(s)
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300 rounded">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-3 text-left">ID</th>
              <th className="border p-3 text-left">Título</th>
              <th className="border p-3 text-left">Fecha</th>
              <th className="border p-3 text-left">Estado</th>
              <th className="border p-3 text-left">Predios</th>
              <th className="border p-3 text-left">Etnia</th>
              <th className="border p-3 text-left">Extensionista</th>
            </tr>
          </thead>
          <tbody>
            {reportesFiltrados.length > 0 ? (
              reportesFiltrados.map((reporte) => (
                <tr key={reporte.id} className="border-b hover:bg-gray-100">
                  <td className="border p-3">{reporte.id}</td>
                  <td className="border p-3 font-medium">{reporte.titulo}</td>
                  <td className="border p-3">{reporte.fecha}</td>
                  <td className="border p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      reporte.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                      reporte.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {reporte.estado}
                    </span>
                  </td>
                  <td className="border p-3">{reporte.predios}</td>
                  <td className="border p-3">{reporte.extensionista}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="border p-8 text-center text-gray-500">
                  No se encontraron reportes que coincidan con tu búsqueda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}