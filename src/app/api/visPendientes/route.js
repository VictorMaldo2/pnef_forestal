import { NextResponse } from 'next/server'
import { pool } from '../../../lib/db'

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
        p.rut    AS propietario_rut,
        p.comuna AS propietario_comuna,
        p.comunidad_indigena,
        p.comunidad_nombre,
        u.nombre AS extensionista_nombre,
        u.email  AS extensionista_email
      FROM visitass v
      JOIN propietarios p ON v.propietario_id = p.id
      JOIN auth_users   u ON v.extensionista_id = u.id
      WHERE v.estado = 'pendiente'
      ORDER BY v.fecha_visita DESC, v.hora_visita DESC
    `)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error al obtener visitas pendientes:', error)
    return NextResponse.json({ error: 'Error al obtener visitas pendientes' }, { status: 500 })
  }
}

// Modificar visita
export async function PUT(request) {
  try {
    const { id, fecha_visita, hora_visita, actividad, observaciones } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Falta el id de la visita' }, { status: 400 })
    }

    await pool.query(`
      UPDATE visitass
      SET
        fecha_visita  = $1,
        hora_visita   = $2,
        actividad     = $3,
        observaciones = $4,
        actualizado_en = NOW()
      WHERE id = $5
    `, [fecha_visita, hora_visita, actividad, observaciones, id])

    return NextResponse.json({ message: 'Visita actualizada correctamente' })
  } catch (error) {
    console.error('Error al actualizar visita:', error)
    return NextResponse.json({ error: 'Error al actualizar visita' }, { status: 500 })
  }
}

// Cancelar visita
export async function DELETE(request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Falta el id de la visita' }, { status: 400 })
    }

    await pool.query(`
      UPDATE visitass
      SET estado = 'cancelada', actualizado_en = NOW()
      WHERE id = $1
    `, [id])

    return NextResponse.json({ message: 'Visita cancelada correctamente' })
  } catch (error) {
    console.error('Error al cancelar visita:', error)
    return NextResponse.json({ error: 'Error al cancelar visita' }, { status: 500 })
  }
}