// src/app/api/jornada_marcacion/route.js

import { Pool } from 'pg'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route' 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function POST(request) {
  try {
    // 1. Validar sesión
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const extensionista_id = session.user.id

    // 2. Leer body
    const body = await request.json()

    const {
      propietario_id,
      nombre_predio,
      rol,
      nro_resolucion,
      fecha_resolucion,
      fecha_jornada,
      punto_referencia_huso,
      punto_referencia_este,
      punto_referencia_norte,
      superficie_total_predio,
      superficie_bajo_regimen,
      superficie_manejada,
      superficie_bosque_nativo,
      superficie_anual_planificada,
      superficie_marcada,
      superficie_marcada_km,
      observaciones,
      prescripciones,
      medidas_proteccion,
      materiales_utilizados,
      firma_supervisor,
      firma_propietario,
      actividades
    } = body

    // 3. Validar campos obligatorios
    if (!propietario_id || !fecha_jornada) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: propietario_id y fecha_jornada' },
        { status: 400 }
      )
    }

    // 4. Insertar en DB
    const query = `
      INSERT INTO jornada_marcacion (
        propietario_id, extensionista_id, nombre_predio, rol,
        nro_resolucion, fecha_resolucion, fecha_jornada,
        punto_referencia_huso, punto_referencia_este, punto_referencia_norte,
        superficie_total_predio, superficie_bajo_regimen, superficie_manejada,
        superficie_bosque_nativo, superficie_anual_planificada,
        superficie_marcada, superficie_marcada_km,
        observaciones, prescripciones, medidas_proteccion,
        materiales_utilizados, firma_supervisor,
        firma_propietario, actividades
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7,
        $8, $9, $10,
        $11, $12, $13,
        $14, $15,
        $16, $17,
        $18, $19, $20,
        $21, $22, $23,
        $24
      )
      RETURNING id
    `

    const values = [
      propietario_id, extensionista_id, nombre_predio, rol,
      nro_resolucion || null, fecha_resolucion || null, fecha_jornada,
      punto_referencia_huso || null, punto_referencia_este || null, punto_referencia_norte || null,
      superficie_total_predio || null, superficie_bajo_regimen || null, superficie_manejada || null,
      superficie_bosque_nativo || null, superficie_anual_planificada || null,
      superficie_marcada || null, superficie_marcada_km || null,
      observaciones || null, prescripciones || null, medidas_proteccion || null,
      materiales_utilizados || null, firma_supervisor || null,
      firma_propietario || null,
      actividades
    ]

    const result = await pool.query(query, values)

    return NextResponse.json(
      { message: 'Jornada registrada con éxito', id: result.rows[0].id },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error en POST /api/jornada_marcacion:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}