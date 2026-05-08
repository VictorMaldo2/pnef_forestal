'use client'

import { useEffect, useState } from 'react'
import UsuariosTable from './UsuariosTable'

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const res = await fetch('/api/usuarios')
        if (!res.ok) {
          throw new Error('Fallo al obtener usuarios')
        }
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

  if (loading) return <div>Cargando usuarios...</div>
  if (error) return <div className="text-red-600">Error: {error}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
      <UsuariosTable usuarios={usuarios} />
    </div>
  )
}