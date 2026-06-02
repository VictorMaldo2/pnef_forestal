import { Pool } from 'pg'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const esAdmin = session.user.roleId === 1
    const id      = session.user.id

    // Talonarios
    const talonarios = await pool.query(`
      SELECT
        tt.*,
        'talonario'  AS tipo,
        tt.fecha     AS fecha,
        p.nombre     AS propietario_nombre,
        p.rut        AS propietario_rut,
        p.comuna     AS propietario_comuna,
        u.nombre     AS extensionista_nombre,
        u.rut        AS extensionista_rut
      FROM talonario_terreno tt
      LEFT JOIN propietarios p ON p.id = tt.propietario_id
      LEFT JOIN usuarios     u ON u.id::text = tt.extensionista_id::text
      ${!esAdmin ? `WHERE tt.extensionista_id::text = $1` : ''}
      ORDER BY tt.fecha DESC
    `, !esAdmin ? [id] : [])

    // Jornadas de marcación
    const marcaciones = await pool.query(`
      SELECT
        jm.*,
        'marcacion'      AS tipo,
        jm.fecha_jornada AS fecha,
        p.nombre         AS propietario_nombre,
        p.rut            AS propietario_rut,
        p.comuna         AS propietario_comuna,
        u.nombre         AS extensionista_nombre,
        u.rut            AS extensionista_rut
      FROM jornada_marcacion jm
      LEFT JOIN propietarios p ON p.id = jm.propietario_id
      LEFT JOIN usuarios     u ON u.id::text = jm.extensionista_id::text
      ${!esAdmin ? `WHERE jm.extensionista_id::text = $1` : ''}
      ORDER BY jm.fecha_jornada DESC
    `, !esAdmin ? [id] : [])

    const data = [...talonarios.rows, ...marcaciones.rows].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error en GET /api/jornadas_completa:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}