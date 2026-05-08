'use client'

import { useEffect, useState } from 'react'

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const res = await fetch('/api/usuarios')
        if (!res.ok) throw new Error('Error al obtener usuarios')
        const data = await res.json()
        setUsuarios(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchUsuarios()
  }, [])

  if (loading) return <p>Cargando usuarios...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Gestión de Usuarios</h1>
      <table className="w-full border border-gray-300 rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Email</th>
            <th className="border p-2 text-left">NOMBRE</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => (
            <tr key={user.id} className="hover:bg-gray-100">
              <td className="border p-2">{user.id}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}