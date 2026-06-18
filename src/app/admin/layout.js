import Link from "next/link"

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      

      {/* Contenido principal */}
      <main className="flex-1 min-w-0 overflow-x-hidden p-4 sm:p-8 bg-white">{children}</main>
    </div>
  )
}