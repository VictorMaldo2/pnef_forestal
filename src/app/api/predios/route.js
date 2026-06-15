import { NextResponse } from 'next/server'
import { pool } from '../../../lib/db'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const propietario_id = searchParams.get('propietario_id')

  try {
    const result = await pool.query(
      `SELECT id, nombre, rol, comuna, superficie_total
       FROM predios
       WHERE propietario_id = $1
       ORDER BY nombre ASC`,
      [propietario_id]
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error en GET /api/predios:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { propietario_id, nombre, rol, comuna, superficie_total } = await req.json()

    if (!propietario_id || !nombre) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO predios (propietario_id, nombre, rol, comuna, superficie_total)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [propietario_id, nombre, rol || null, comuna || null, superficie_total || null]
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/predios:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}