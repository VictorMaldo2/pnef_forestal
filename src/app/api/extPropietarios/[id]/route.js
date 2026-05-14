import { NextResponse } from 'next/server'
import { pool } from '../../../../lib/db'  // Ajusta ruta según estructura

// Fuerza el modo dinámico para acceder correctamente a params
export const dynamic = 'force-dynamic'

export async function PUT(request, context) {
  const params = await context.params  // await para resolver la promesa
  const id = params.id

  try {
    const { nombre, rut, comunidad_indigena, comuna, tipo_propietario } = await request.json()

    const comunidadBool = comunidad_indigena === true || comunidad_indigena === 'true'

    const result = await pool.query(
      `UPDATE propietarios SET
         nombre=$1,
         rut=$2,
         comunidad_indigena=$3,
         comuna=$4,
         tipo_propietario=$5,
         actualizado_en=NOW()
       WHERE id=$6
       RETURNING *`,
      [nombre, rut, comunidadBool, comuna, tipo_propietario, id]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Propietario no encontrado' }, { status: 404 })
    }
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error al actualizar propietario:', error)
    return NextResponse.json({ error: 'Error al actualizar propietario' }, { status: 500 })
  }
}

export async function DELETE(request, context) {
  const params = await context.params
  const id = params.id

  try {
    const result = await pool.query('DELETE FROM propietarios WHERE id = $1', [id])
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Propietario no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Propietario eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar propietario:', error)
    return NextResponse.json({ error: 'Error al eliminar propietario' }, { status: 500 })
  }
}