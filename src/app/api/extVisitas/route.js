import { NextResponse } from 'next/server'
import { pool } from '../../../lib/db'  // Ruta relativa desde api/extVisitas
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'  // Ajusta ruta según estructura

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        v.id,
        v.fecha_visita,
        v.hora_visita,
        v.estado,
        v.observaciones,
        v.actividad,
        p.nombre AS propietario_nombre,
        p.rut AS propietario_rut
      FROM visitass v
      JOIN propietarios p ON v.propietario_id = p.id
      ORDER BY v.fecha_visita DESC, v.hora_visita DESC
    `)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error en GET /api/extVisitas:', error)
    return NextResponse.json({ error: 'Error al obtener visitas' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Validar sesión y obtener extensionista_id seguro
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const extensionista_id = session.user.id

    const {
      propietario_id,
      fecha_visita,
      hora_visita = '00:00',
      estado,
      observaciones,
      actividad
    } = await request.json()

    const result = await pool.query(
      `INSERT INTO visitass (propietario_id, extensionista_id, fecha_visita, hora_visita, estado, observaciones, actividad, creado_en, actualizado_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [propietario_id, extensionista_id, fecha_visita, hora_visita, estado, observaciones, actividad]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error en POST /api/extVisitas:', error)
    return NextResponse.json({ error: 'Error al crear visita: ' + error.message }, { status: 500 })
  }
}