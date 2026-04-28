import Link from "next/link"

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Panel Admin</h2>
        <nav className="flex flex-col space-y-3">
          <Link href="/admin" className="hover:underline">Dashboard</Link>
          <Link href="/admin/usuarios" className="hover:underline">Usuarios</Link>
          <Link href="/admin/reportes" className="hover:underline">Reportes</Link>
          <Link href="/admin/settings" className="hover:underline">Configuración</Link>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8 bg-white">{children}</main>
    </div>
  )
}