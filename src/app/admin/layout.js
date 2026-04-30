import Link from "next/link"

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      

      {/* Contenido principal */}
      <main className="flex-1 p-8 bg-white">{children}</main>
    </div>
  )
}