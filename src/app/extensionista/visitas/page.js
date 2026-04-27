export default function VisitasPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-green-800">Visitas Agendadas</h2>
      <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
        <div className="p-6 border-b border-green-100">
          <h3 className="text-xl font-semibold text-green-800">Próximas Visitas</h3>
        </div>
        <div className="p-6">
          {/* Calendario y formulario aquí */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-4">Calendario</h4>
              {/* Aquí iría el calendario */}
            </div>
            <div>
              <h4 className="font-semibold mb-4">Nueva Visita</h4>
              {/* Aquí iría el formulario */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}