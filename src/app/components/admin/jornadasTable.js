export default function JornadasTable({ jornadas }) {
  return (
    <table className="min-w-full table-auto border border-gray-300 rounded">
      <thead className="bg-gray-200">
        <tr>
          <th className="border p-3 text-left">ID</th>
          <th className="border p-3 text-left">Predio</th>
          <th className="border p-3 text-left">Fecha</th>
          <th className="border p-3 text-left">Estado</th>
        </tr>
      </thead>
      <tbody>
        {jornadas.map(jornada => (
          <tr key={jornada.id} className="border-b hover:bg-gray-100">
            <td className="border p-3">{jornada.id}</td>
            <td className="border p-3">{jornada.predio}</td>
            <td className="border p-3">{jornada.fecha}</td>
            <td className="border p-3">{jornada.estado}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}