import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET() {
  try {
    const client = await pool.connect()
    const result = await client.query(`
      SELECT
        p.id,
        p.nombre,
        p.rut,
        p.comunidad_indigena,
        p.comunidad_nombre,
        p.genero,
        p.comuna,
        p.tipo_propietario,
        COUNT(v.id) FILTER (WHERE v.estado = 'pendiente') AS visitas_pendientes
      FROM propietarios p
      LEFT JOIN visitass v ON v.propietario_id = p.id
      GROUP BY p.id
      ORDER BY p.nombre ASC
    `)
    client.release()
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error en GET /api/admpropietarios:', error)
    return NextResponse.json(
      { error: 'Error al obtener propietarios: ' + error.message },
      { status: 500 }
    )
  }
}