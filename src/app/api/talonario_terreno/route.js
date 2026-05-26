import { Pool } from 'pg'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route' 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const extensionista_id = session.user.id
    const body = await request.json()

    const {
      propietario_id,
      nro_talonario,
      tipo_recurso,
      fecha,
      punto_referencia_huso,
      punto_referencia_este,
      punto_referencia_norte,
      nombre_persona_presente,
      rol_persona_presente,
      actividades,
      observaciones,
      superficie_total_predio,
      superficie_anual_planificada,
      superficie_bajo_regimen,
      superficie_avance_ejecucion,
      recomendaciones_observaciones,
      medidas_prevencion_incendios,
      carbon_saco,
      lena_m3,
      madera_pulgada,
      durmientes,
      metros_rumas,
      hojas_corteza,
      visitantes_sendero,
      productos_otro_1,
      productos_otro_1_valor,
      productos_otro_2,
      productos_otro_2_valor,
      firma_propietario,
    } = body

    if (!propietario_id || !fecha) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: propietario_id y fecha' },
        { status: 400 }
      )
    }

    const query = `
      INSERT INTO talonario_terreno (
        propietario_id, extensionista_id,
        nro_talonario, tipo_recurso, fecha,
        punto_referencia_huso, punto_referencia_este, punto_referencia_norte,
        nombre_persona_presente, rol_persona_presente,
        actividades, observaciones,
        superficie_total_predio, superficie_anual_planificada,
        superficie_bajo_regimen, superficie_avance_ejecucion,
        recomendaciones_observaciones, medidas_prevencion_incendios,
        carbon_saco, lena_m3, madera_pulgada,
        durmientes, metros_rumas, hojas_corteza, visitantes_sendero,
        productos_otro_1, productos_otro_1_valor,
        productos_otro_2, productos_otro_2_valor,
        firma_propietario
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30
      )
      RETURNING id
    `

    const values = [
      propietario_id, extensionista_id,
      nro_talonario || null, tipo_recurso || null, fecha,
      punto_referencia_huso || null, punto_referencia_este || null, punto_referencia_norte || null,
      nombre_persona_presente || null, rol_persona_presente || null,
      actividades && actividades.length > 0 ? actividades : [],
      observaciones || null,
      superficie_total_predio || null, superficie_anual_planificada || null,
      superficie_bajo_regimen || null, superficie_avance_ejecucion || null,
      recomendaciones_observaciones || null, medidas_prevencion_incendios || null,
      carbon_saco || null, lena_m3 || null, madera_pulgada || null,
      durmientes || null, metros_rumas || null, hojas_corteza || null, visitantes_sendero || null,
      productos_otro_1 || null, productos_otro_1_valor || null,
      productos_otro_2 || null, productos_otro_2_valor || null,
      firma_propietario || null,
    ]

    const result = await pool.query(query, values)

    return NextResponse.json(
      { message: 'Talonario registrado con éxito', id: result.rows[0].id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error en POST /api/talonario_terreno:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}