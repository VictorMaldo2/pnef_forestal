'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')

    // Paso 1: Login con Supabase Auth
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('Respuesta login:', { data, signInError })

    if (signInError) {
      setError(signInError.message)
      return
    }

    const user = data.user

    if (!user) {
      setError('No se pudo iniciar sesión')
      return
    }

    // Paso 2: Consulta datos extendidos y rol en tabla usuarios
    const { data: usuarioDB, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id, rut, nombre, role_id')
      .eq('id', user.id)
      .single()

    console.log('Datos usuario DB:', usuarioDB, 'Error:', usuarioError)

    if (usuarioError || !usuarioDB) {
      setError('Usuario no autorizado o no registrado en base de datos')
      return
    }

    // Paso 3: Redirigir según role_id directamente
    console.log('Role ID del usuario:', usuarioDB.role_id)

    if (usuarioDB.role_id === 1) {
      router.push('/admin')
    } else if (usuarioDB.role_id === 2) {
      router.push('/extensionista')
    } else {
      setError('Rol de usuario no reconocido')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-80">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>
        {error && <p className="mb-4 text-red-600">{error}</p>}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full p-3 border rounded mb-4"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full p-3 border rounded mb-6"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
        >
          Entrar
        </button>
      </form>
    </div>
  )
}