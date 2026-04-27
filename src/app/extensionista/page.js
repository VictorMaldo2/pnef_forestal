export default function ExtensionistaDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-8 text-green-800">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Propietarios</h3>
          <p className="text-3xl font-bold text-green-600">23</p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Visitas Pendientes</h3>
          <p className="text-3xl font-bold text-yellow-600">5</p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Jornadas Completadas</h3>
          <p className="text-3xl font-bold text-blue-600">12</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-green-100">
          <h3 className="text-xl font-semibold mb-4 text-green-800">Próximas Visitas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span>Juan Pérez</span>
              <span className="text-sm text-yellow-600 font-medium">15 Jun</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span>María González</span>
              <span className="text-sm text-yellow-600 font-medium">20 Jun</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg border border-green-100">
          <h3 className="text-xl font-semibold mb-4 text-green-800">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition-all duration-200">
              + Agendar Visita
            </button>
            <button className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-all duration-200">
              Nueva Jornada
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}