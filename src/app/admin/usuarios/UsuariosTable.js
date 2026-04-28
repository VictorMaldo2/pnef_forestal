export default function UsuariosTable({ usuarios }) {
  return (
    <table className="min-w-full table-auto border border-gray-300 rounded">
      <thead className="bg-gray-200">
        <tr>
          <th className="border p-3">Nombre</th>
          <th className="border p-3">Rol</th>
          <th className="border p-3">Email</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((user) => (
          <tr key={user.id} className="border-b hover:bg-gray-100">
            <td className="border p-3">{user.nombre}</td>
            <td className="border p-3">{user.rol}</td>
            <td className="border p-3">{user.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}