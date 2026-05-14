import { NextResponse } from 'next/server'
import { pool } from '../../../lib/db' // Ajusta la ruta según sea necesario

export async function POST(request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID de visita obligatorio" }, { status: 400 })
    }

    const result = await pool.query(
      `UPDATE visitass 
       SET estado = 'completada', actualizado_en = NOW() 
       WHERE id = $1 RETURNING *`,
      [id]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Visita no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ message: "Visita marcada como completada", visita: result.rows[0] })
  } catch (error) {
    console.error("Error al actualizar estado:", error)
    return NextResponse.json({ error: "Error al actualizar estado de visita" }, { status: 500 })
  }
}