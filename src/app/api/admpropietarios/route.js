import { NextResponse } from 'next/server'
import { Pool } from 'pg'

// Configura conexión a Postgres, usando DATABASE_URL definido en .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,  // dependiendo de tu proveedor
  },
})

export async function GET() {
  try {
    const client = await pool.connect()
    const result = await client.query(`
      SELECT
        p.id,
        p.nombre,
        p.rut,
        CASE WHEN p.comunidad_indigena THEN p.comunidad_nombre ELSE NULL END as comunidad_indigena,
        p.genero,
        p.comuna,
        p.tipo_propietario,
        -- Aquí debes hacer el cálculo de visitas_pendientes por propietario si tienes esa tabla relacionada
        -- Por simplicidad asumo 0 o puedes unir con tabla visitas filtrando por estado='pendiente'
        0 as visitas_pendientes
      FROM propietarios p
      ORDER BY p.nombre ASC
    `)
    client.release()
    return NextResponse.json(result.rows)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener propietarios: ' + error.message },
      { status: 500 }
    )
  }
}