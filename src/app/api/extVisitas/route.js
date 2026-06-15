import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { pool } from '../../../lib/db'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { propietario_id, predio_id, fecha_visita, hora_visita, actividad, descripcion, estado } = await req.json()

    if (!propietario_id || !fecha_visita) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO visitass (propietario_id, extensionista_id, predio_id, fecha_visita, hora_visita, actividad, observaciones, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [propietario_id, session.user.id, predio_id || null, fecha_visita, hora_visita || null, actividad || null, descripcion || null, estado || 'pendiente']
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/extVisitas:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}