import UsuariosTable from "./UsuariosTable"

export default function AdminUsuarios() {
  // Datos de ejemplo (mock), se reemplazará con llamada a base de datos
  const usuariosMock = [
    { id: "1", nombre: "Juan Pérez", rol: "admin", email: "juan@pnef.cl" },
    { id: "2", nombre: "María Gómez", rol: "extensionista", email: "maria@pnef.cl" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
      <UsuariosTable usuarios={usuariosMock} />
    </div>
  )
}