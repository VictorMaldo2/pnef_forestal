import { Pool } from 'pg'
import bcrypt from 'bcrypt'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export async function POST(request) {
  const { email, password } = await request.json()

  try {
    // Buscar usuario
    const result = await pool.query(
      'SELECT id, nombre, email, hashed_password, role_id FROM auth_users WHERE email = $1',
      [email]
    )

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 401 })
    }

    const user = result.rows[0]

    // Comparar password
    const isValid = await bcrypt.compare(password, user.hashed_password)
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Contraseña incorrecta' }), { status: 401 })
    }

    // Autenticación exitosa
    return new Response(
      JSON.stringify({ 
        id: user.id, 
        nombre: user.nombre, 
        email: user.email, 
        role_id: user.role_id 
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Error en /api/login:', error)  // Aquí mostramos el error en consola
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}