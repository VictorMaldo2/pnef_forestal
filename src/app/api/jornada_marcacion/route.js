import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { pool } from '../../../lib/db'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const {
      propietario_id, predio_id, rol, nro_resolucion, fecha_resolucion, fecha_jornada,
      punto_referencia_huso, punto_referencia_este, punto_referencia_norte,
      superficie_total_predio, superficie_bajo_regimen, superficie_manejada,
      superficie_bosque_nativo, superficie_anual_planificada, superficie_marcada,
      superficie_marcada_km, observaciones, prescripciones, medidas_proteccion,
      materiales_utilizados, actividades,
    } = await req.json()

    const result = await pool.query(
      `INSERT INTO jornada_marcacion (
        propietario_id, extensionista_id, predio_id, rol, nro_resolucion,
        fecha_resolucion, fecha_jornada, punto_referencia_huso, punto_referencia_este,
        punto_referencia_norte, superficie_total_predio, superficie_bajo_regimen,
        superficie_manejada, superficie_bosque_nativo, superficie_anual_planificada,
        superficie_marcada, superficie_marcada_km, observaciones, prescripciones,
        medidas_proteccion, materiales_utilizados, actividades
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
      ) RETURNING *`,
      [
        propietario_id, session.user.id, predio_id || null, rol, nro_resolucion,
        fecha_resolucion, fecha_jornada, punto_referencia_huso, punto_referencia_este,
        punto_referencia_norte, superficie_total_predio, superficie_bajo_regimen,
        superficie_manejada, superficie_bosque_nativo, superficie_anual_planificada,
        superficie_marcada, superficie_marcada_km, observaciones, prescripciones,
        medidas_proteccion, materiales_utilizados, actividades,
      ]
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/jornada_marcacion:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}