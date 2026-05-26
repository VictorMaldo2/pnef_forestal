import { NextResponse } from 'next/server'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        au.id,
        au.email,
        u.nombre,
        u.rut,
        u.telefono,
        u.role_id,
        CASE u.role_id
          WHEN 1 THEN 'Administrador'
          WHEN 2 THEN 'Extensionista'
          ELSE 'Sin rol'
        END AS rol
      FROM auth_users au
      LEFT JOIN usuarios u ON u.id::text = au.id::text
      ORDER BY u.nombre ASC
    `)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error en GET /api/usuarios:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  const client = await pool.connect()
  try {
    const { email, password, nombre, rut, telefono, role_id } = await request.json()

    if (!email || !password || !nombre || !rut || !role_id) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: email, password, nombre, rut y rol' },
        { status: 400 }
      )
    }

    const hashed = await bcrypt.hash(password, 10)
    const id = randomUUID()

    await client.query('BEGIN')

    await client.query(
      'INSERT INTO auth_users (id, email, hashed_password) VALUES ($1, $2, $3)',
      [id, email, hashed]
    )

    await client.query(
      'INSERT INTO usuarios (id, nombre, rut, telefono, role_id) VALUES ($1, $2, $3, $4, $5)',
      [id, nombre, rut, telefono || null, role_id]
    )

    await client.query('COMMIT')

    return NextResponse.json({ message: 'Usuario creado correctamente', id }, { status: 201 })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error en POST /api/usuarios:', error)

    if (error.code === '23505') {
      const campo = error.constraint?.includes('email') ? 'El email' : 'El RUT'
      return NextResponse.json(
        { error: `${campo} ya está registrado en el sistema.` },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function PUT(request) {
  const client = await pool.connect()
  try {
    const { id, email, nombre, rut, telefono, role_id, password } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Falta el id del usuario' }, { status: 400 })
    }

    await client.query('BEGIN')

    // Actualizar email en auth_users
    await client.query(
      'UPDATE auth_users SET email = $1 WHERE id = $2',
      [email, id]
    )

    // Si viene nueva contraseña, actualizarla
    if (password && password.trim() !== '') {
      const hashed = await bcrypt.hash(password, 10)
      await client.query(
        'UPDATE auth_users SET hashed_password = $1 WHERE id = $2',
        [hashed, id]
      )
    }

    // Actualizar datos en usuarios
    await client.query(
      'UPDATE usuarios SET nombre = $1, rut = $2, telefono = $3, role_id = $4 WHERE id::text = $5',
      [nombre, rut, telefono || null, role_id, id]
    )

    await client.query('COMMIT')

    return NextResponse.json({ message: 'Usuario actualizado correctamente' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error en PUT /api/usuarios:', error)

    if (error.code === '23505') {
      const campo = error.constraint?.includes('email') ? 'El email' : 'El RUT'
      return NextResponse.json(
        { error: `${campo} ya está registrado en el sistema.` },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function DELETE(request) {
  const client = await pool.connect()
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Falta el id del usuario' }, { status: 400 })
    }

    await client.query('BEGIN')
    await client.query('DELETE FROM usuarios WHERE id::text = $1', [id])
    await client.query('DELETE FROM auth_users WHERE id = $1', [id])
    await client.query('COMMIT')

    return NextResponse.json({ message: 'Usuario eliminado correctamente' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error en DELETE /api/usuarios:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    client.release()
  }
}