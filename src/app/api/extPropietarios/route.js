import { NextResponse } from 'next/server'
import { pool } from '../../../lib/db'   // Ruta relativa desde api/extPropietarios

export async function GET() {
  try {
    const result = await pool.query('SELECT id, nombre, rut, comunidad_indigena, comunidad_nombre, comuna, tipo_propietario FROM propietarios ORDER BY nombre ASC')
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error en GET /api/extPropietarios:', error)
    return NextResponse.json({ error: 'Error al obtener propietarios' }, { status: 500 })
  }
}