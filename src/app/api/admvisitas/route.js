import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

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
        u.nombre AS extensionista_nombre,
        u.rut    AS extensionista_rut,
        p.nombre AS propietario_nombre,
        p.rut    AS propietario_rut,
        p.comunidad_indigena,
        p.comunidad_nombre,
        p.genero,
        p.comuna AS propietario_comuna
      FROM visitass v
      INNER JOIN usuarios     u ON v.extensionista_id = u.id
      INNER JOIN propietarios p ON v.propietario_id = p.id
      WHERE u.role_id = 2
      ORDER BY v.fecha_visita DESC, v.hora_visita DESC
    `)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error en GET /api/admvisitas:', error)
    return NextResponse.json({ error: 'Error al obtener visitas' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { id, fecha_visita, hora_visita, estado, actividad, observaciones } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Falta el id de la visita' }, { status: 400 })
    }

    await pool.query(`
      UPDATE visitass
      SET
        fecha_visita   = $1,
        hora_visita    = $2,
        estado         = $3,
        actividad      = $4,
        observaciones  = $5,
        actualizado_en = NOW()
      WHERE id = $6
    `, [fecha_visita, hora_visita, estado, actividad, observaciones, id])

    return NextResponse.json({ message: 'Visita actualizada correctamente' })
  } catch (error) {
    console.error('Error en PUT /api/admvisitas:', error)
    return NextResponse.json({ error: 'Error al actualizar visita' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Falta el id de la visita' }, { status: 400 })
    }

    const result = await pool.query(
      'DELETE FROM visitass WHERE id = $1',
      [id]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Visita eliminada correctamente' })
  } catch (error) {
    console.error('Error en DELETE /api/admvisitas:', error)
    return NextResponse.json({ error: 'Error al eliminar visita' }, { status: 500 })
  }
}