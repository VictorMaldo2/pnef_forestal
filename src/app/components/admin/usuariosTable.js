export default function UsuariosTable({ usuarios }) {
  return (
    <table className="min-w-full table-auto border border-gray-300 rounded">
      <thead className="bg-gray-200">
        <tr>
          <th className="border p-3 text-left">ID</th>
          <th className="border p-3 text-left">Nombre</th>
          <th className="border p-3 text-left">Rol</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map(usuario => (
          <tr key={usuario.id} className="border-b hover:bg-gray-100">
            <td className="border p-3">{usuario.id}</td>
            <td className="border p-3">{usuario.nombre}</td>
            <td className="border p-3">{usuario.rol}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}