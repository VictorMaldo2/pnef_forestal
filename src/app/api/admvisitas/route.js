import { NextResponse } from 'next/server'
import { Pool } from 'pg'

// Configura conexión a PostgreSQL usando variable de entorno DATABASE_URL de Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET(request) {
  try {
    const client = await pool.connect()
    const result = await client.query(`
      SELECT
        v.id,
        v.fecha_visita,
        v.hora_visita,
        v.estado,
        v.observaciones,
        u.nombre AS extensionista_nombre,
        u.rut AS extensionista_rut,
        p.nombre AS propietario_nombre,
        p.rut AS propietario_rut,
        p.comunidad_indigena,
        p.comunidad_nombre,
        p.genero,
        p.comuna AS propietario_comuna
      FROM visitass v
      INNER JOIN usuarios u ON v.extensionista_id = u.id
      INNER JOIN propietarios p ON v.propietario_id = p.id
      WHERE u.role_id = 2
      ORDER BY v.fecha_visita DESC, v.hora_visita DESC;
    `)
    client.release()

    return NextResponse.json(result.rows)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener visitas pendientes' }, { status: 500 })
  }
}