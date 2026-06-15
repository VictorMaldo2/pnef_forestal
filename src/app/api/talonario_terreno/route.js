import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { pool } from '../../../lib/db'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const {
      propietario_id, predio_id, nro_talonario, tipo_recurso, fecha,
      punto_referencia_huso, punto_referencia_este, punto_referencia_norte,
      nombre_persona_presente, rol_persona_presente, actividades, observaciones,
      superficie_total_predio, superficie_anual_planificada, superficie_bajo_regimen,
      superficie_avance_ejecucion, recomendaciones_observaciones,
      medidas_prevencion_incendios, carbon_saco, lena_m3, madera_pulgada,
      durmientes, metros_rumas, hojas_corteza, visitantes_sendero,
      productos_otro_1, productos_otro_1_valor, productos_otro_2, productos_otro_2_valor,
    } = await req.json()

    const result = await pool.query(
      `INSERT INTO talonario_terreno (
        propietario_id, extensionista_id, predio_id, nro_talonario, tipo_recurso, fecha,
        punto_referencia_huso, punto_referencia_este, punto_referencia_norte,
        nombre_persona_presente, rol_persona_presente, actividades, observaciones,
        superficie_total_predio, superficie_anual_planificada, superficie_bajo_regimen,
        superficie_avance_ejecucion, recomendaciones_observaciones,
        medidas_prevencion_incendios, carbon_saco, lena_m3, madera_pulgada,
        durmientes, metros_rumas, hojas_corteza, visitantes_sendero,
        productos_otro_1, productos_otro_1_valor, productos_otro_2, productos_otro_2_valor
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
        $20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30
      ) RETURNING *`,
      [
        propietario_id, session.user.id, predio_id || null, nro_talonario, tipo_recurso, fecha,
        punto_referencia_huso, punto_referencia_este, punto_referencia_norte,
        nombre_persona_presente, rol_persona_presente, actividades, observaciones,
        superficie_total_predio, superficie_anual_planificada, superficie_bajo_regimen,
        superficie_avance_ejecucion, recomendaciones_observaciones,
        medidas_prevencion_incendios, carbon_saco, lena_m3, madera_pulgada,
        durmientes, metros_rumas, hojas_corteza, visitantes_sendero,
        productos_otro_1, productos_otro_1_valor, productos_otro_2, productos_otro_2_valor,
      ]
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/talonario_terreno:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}