import { NextResponse } from 'next/server'
import { pool } from '../../../lib/db'  // ajusta la ruta relativa a tu proyecto

export async function GET() {
  try {
    const query = `
      SELECT
        v.id,
        v.fecha_visita,
        v.hora_visita,
        v.estado,
        v.observaciones,
        v.actividad,
        p.nombre AS propietario_nombre,
        p.rut AS propietario_rut,
        p.comuna AS propietario_comuna,
        u.nombre AS extensionista_nombre,
        u.email AS extensionista_email
      FROM visitass v
      JOIN propietarios p ON v.propietario_id = p.id
      JOIN auth_users u ON v.extensionista_id = u.id
      WHERE v.estado = 'pendiente'
      ORDER BY v.fecha_visita DESC, v.hora_visita DESC
    `
    const result = await pool.query(query)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error al obtener visitas pendientes:', error)
    return NextResponse.json({ error: 'Error al obtener visitas pendientes' }, { status: 500 })
  }
}