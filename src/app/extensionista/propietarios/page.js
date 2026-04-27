export default function PropietariosPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-green-800">Propietarios</h2>
      <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
        <div className="p-6 border-b border-green-100">
          <h3 className="text-xl font-semibold text-green-800">Lista de Propietarios</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-green-50">
              <tr>
                <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">Nombre</th>
                <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">RUT</th>
                <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">Comunidad</th>
                <th className="border-b border-green-100 p-4 text-left text-green-800 font-semibold">Comuna</th>
              </tr>
            </thead>
            <tbody>
              {/* Aquí irán los datos reales */}
              <tr className="hover:bg-green-50">
                <td className="border-b border-green-50 p-4 font-medium">Juan Pérez</td>
                <td className="border-b border-green-50 p-4">12345678-9</td>
                <td className="border-b border-green-50 p-4">Mapuche</td>
                <td className="border-b border-green-50 p-4">Temuco</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}