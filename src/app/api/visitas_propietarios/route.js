import { Pool } from 'pg'
import { NextResponse } from 'next/server'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const propietario_id = searchParams.get('propietario_id')

    if (!propietario_id) {
      return NextResponse.json({ error: 'Falta propietario_id' }, { status: 400 })
    }

    const result = await pool.query(`
      SELECT
        v.id,
        v.fecha_visita,
        v.hora_visita,
        v.estado,
        v.observaciones,
        v.actividad,
        v.creado_en,
        u.nombre AS extensionista_nombre
      FROM visitass v
      LEFT JOIN usuarios u ON u.id::text = v.extensionista_id::text
      WHERE v.propietario_id = $1
      ORDER BY v.fecha_visita DESC
    `, [propietario_id])

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error en GET /api/visitas_propietario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}