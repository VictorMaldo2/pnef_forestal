"use client"

import UsuariosTable from "@/components/admin/usuariosTable"
import JornadasTable from "@/components/admin/jornadasTable"

export default function AdminDashboard() {
  // Datos mock para mostrar ejemplo (luego reemplazar con datos reales)
  const usuariosMock = [
    { id: "1", nombre: "Juan Pérez", rol: "admin" },
    { id: "2", nombre: "María González", rol: "extensionista" },
  ];

  const jornadasMock = [
    { id: "1", predio: "Predio A", fecha: "2024-06-10", estado: "completada" },
    { id: "2", predio: "Predio B", fecha: "2024-06-15", estado: "pendiente" },
  ];

  return (
    <main className="p-8 bg-white rounded shadow-md min-h-screen max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Panel de Administración</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Usuarios</h2>
        <UsuariosTable usuarios={usuariosMock} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Jornadas Recientes</h2>
        <JornadasTable jornadas={jornadasMock} />
      </section>
    </main>
  );
}