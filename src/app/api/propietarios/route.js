import { pool } from '@/lib/db'  // la conexión PostgreSQL que tienes en lib/db.js

export async function POST(request) {
  try {
    const data = await request.json()

    const query = `
      INSERT INTO propietarios (
        rut, nombre, comunidad_indigena, comunidad_nombre, genero,
        comuna, tipo_propietario, telefono, email, direccion, creado_en, actualizado_en
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())
      RETURNING *
    `

    const values = [
      data.rut,
      data.nombre,
      data.comunidad_indigena,
      data.comunidad_nombre || null,
      data.genero || null,
      data.comuna || null,
      data.tipo_propietario || null,
      data.telefono || null,
      data.email || null,
      data.direccion || null,
    ]

    const result = await pool.query(query, values)
    return new Response(JSON.stringify({ propietario: result.rows[0] }), { status: 201 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}