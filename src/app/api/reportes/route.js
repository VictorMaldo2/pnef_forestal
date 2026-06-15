import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const desde         = searchParams.get('desde') || ''
  const hasta         = searchParams.get('hasta') || ''
  const extensionista = searchParams.get('extensionista') || ''
  const comuna        = searchParams.get('comuna') || ''
  const propietario   = searchParams.get('propietario') || ''
  const comunidad     = searchParams.get('comunidad') || ''
  const predio        = searchParams.get('predio') || ''

  const client = await pool.connect()

  try {
    const filtrosTalonario = []
    const filtrosMarcacion = []
    const filtrosVisitas   = []
    const valoresTalonario = []
    const valoresMarcacion = []
    const valoresVisitas   = []
    let i = 1, j = 1, v = 1

    if (desde) {
      filtrosTalonario.push(`t.fecha >= $${i++}`);         valoresTalonario.push(desde)
      filtrosMarcacion.push(`m.fecha_jornada >= $${j++}`); valoresMarcacion.push(desde)
      filtrosVisitas.push(`v.fecha_visita >= $${v++}`);    valoresVisitas.push(desde)
    }
    if (hasta) {
      filtrosTalonario.push(`t.fecha <= $${i++}`);         valoresTalonario.push(hasta)
      filtrosMarcacion.push(`m.fecha_jornada <= $${j++}`); valoresMarcacion.push(hasta)
      filtrosVisitas.push(`v.fecha_visita <= $${v++}`);    valoresVisitas.push(hasta)
    }
    if (extensionista) {
      filtrosTalonario.push(`u.nombre = $${i++}`); valoresTalonario.push(extensionista)
      filtrosMarcacion.push(`u.nombre = $${j++}`); valoresMarcacion.push(extensionista)
      filtrosVisitas.push(`u.nombre = $${v++}`);   valoresVisitas.push(extensionista)
    }
    if (comuna) {
      filtrosTalonario.push(`p.comuna = $${i++}`); valoresTalonario.push(comuna)
      filtrosMarcacion.push(`p.comuna = $${j++}`); valoresMarcacion.push(comuna)
      filtrosVisitas.push(`p.comuna = $${v++}`);   valoresVisitas.push(comuna)
    }
    if (propietario) {
      filtrosTalonario.push(`p.nombre ILIKE $${i++}`); valoresTalonario.push(`%${propietario}%`)
      filtrosMarcacion.push(`p.nombre ILIKE $${j++}`); valoresMarcacion.push(`%${propietario}%`)
      filtrosVisitas.push(`p.nombre ILIKE $${v++}`);   valoresVisitas.push(`%${propietario}%`)
    }
    if (comunidad) {
      filtrosTalonario.push(`p.comunidad_nombre = $${i++}`); valoresTalonario.push(comunidad)
      filtrosMarcacion.push(`p.comunidad_nombre = $${j++}`); valoresMarcacion.push(comunidad)
      filtrosVisitas.push(`p.comunidad_nombre = $${v++}`);   valoresVisitas.push(comunidad)
    }
    if (predio) {
      filtrosTalonario.push(`pr.nombre ILIKE $${i++}`); valoresTalonario.push(`%${predio}%`)
      filtrosMarcacion.push(`pr.nombre ILIKE $${j++}`); valoresMarcacion.push(`%${predio}%`)
      filtrosVisitas.push(`pr.nombre ILIKE $${v++}`);   valoresVisitas.push(`%${predio}%`)
    }

    const wT = filtrosTalonario.length ? `WHERE ${filtrosTalonario.join(' AND ')}` : ''
    const wM = filtrosMarcacion.length  ? `WHERE ${filtrosMarcacion.join(' AND ')}`  : ''
    const wV = filtrosVisitas.length    ? `WHERE ${filtrosVisitas.join(' AND ')}`    : ''

    // ── KPIs talonarios ──────────────────────────────────────────────────────
    const kpiTalonario = await client.query(`
      SELECT
        COUNT(*)::int                                                        AS total,
        COUNT(DISTINCT t.propietario_id)::int                               AS propietarios,
        COALESCE(ROUND(SUM(t.superficie_total_predio)::numeric, 2), 0)      AS sup_total,
        COALESCE(ROUND(SUM(t.superficie_anual_planificada)::numeric, 2), 0) AS sup_planificada,
        COALESCE(ROUND(SUM(t.superficie_avance_ejecucion::numeric), 2), 0)  AS sup_ejecutada
      FROM talonario_terreno t
      JOIN propietarios p      ON p.id = t.propietario_id
      JOIN usuarios u          ON u.id = t.extensionista_id
      LEFT JOIN predios pr     ON pr.id = t.predio_id
      ${wT}
    `, valoresTalonario)

    // ── KPIs marcacion ───────────────────────────────────────────────────────
    const kpiMarcacion = await client.query(`
      SELECT
        COUNT(*)::int                                                        AS total,
        COUNT(DISTINCT m.propietario_id)::int                               AS propietarios,
        COALESCE(ROUND(SUM(m.superficie_total_predio)::numeric, 2), 0)      AS sup_total,
        COALESCE(ROUND(SUM(m.superficie_anual_planificada)::numeric, 2), 0) AS sup_planificada,
        COALESCE(ROUND(SUM(m.superficie_marcada)::numeric, 2), 0)           AS sup_ejecutada
      FROM jornada_marcacion m
      JOIN propietarios p      ON p.id = m.propietario_id
      JOIN usuarios u          ON u.id = m.extensionista_id
      LEFT JOIN predios pr     ON pr.id = m.predio_id
      ${wM}
    `, valoresMarcacion)

    // ── Jornadas por mes ─────────────────────────────────────────────────────
    const porMesTalonario = await client.query(`
      SELECT TO_CHAR(DATE_TRUNC('month', t.fecha), 'YYYY-MM') AS mes, COUNT(*)::int AS total
      FROM talonario_terreno t
      JOIN propietarios p  ON p.id = t.propietario_id
      JOIN usuarios u      ON u.id = t.extensionista_id
      LEFT JOIN predios pr ON pr.id = t.predio_id
      ${wT} GROUP BY 1 ORDER BY 1
    `, valoresTalonario)

    const porMesMarcacion = await client.query(`
      SELECT TO_CHAR(DATE_TRUNC('month', m.fecha_jornada), 'YYYY-MM') AS mes, COUNT(*)::int AS total
      FROM jornada_marcacion m
      JOIN propietarios p  ON p.id = m.propietario_id
      JOIN usuarios u      ON u.id = m.extensionista_id
      LEFT JOIN predios pr ON pr.id = m.predio_id
      ${wM} GROUP BY 1 ORDER BY 1
    `, valoresMarcacion)

    // ── Por extensionista ────────────────────────────────────────────────────
    const extTalonario = await client.query(`
      SELECT u.nombre AS extensionista_nombre, COUNT(*)::int AS jornadas,
        COUNT(DISTINCT t.propietario_id)::int AS propietarios,
        COALESCE(ROUND(SUM(t.superficie_total_predio)::numeric, 2), 0) AS sup_total
      FROM talonario_terreno t
      JOIN propietarios p  ON p.id = t.propietario_id
      JOIN usuarios u      ON u.id = t.extensionista_id
      LEFT JOIN predios pr ON pr.id = t.predio_id
      ${wT} GROUP BY u.nombre ORDER BY jornadas DESC
    `, valoresTalonario)

    const extMarcacion = await client.query(`
      SELECT u.nombre AS extensionista_nombre, COUNT(*)::int AS jornadas,
        COUNT(DISTINCT m.propietario_id)::int AS propietarios,
        COALESCE(ROUND(SUM(m.superficie_total_predio)::numeric, 2), 0) AS sup_total
      FROM jornada_marcacion m
      JOIN propietarios p  ON p.id = m.propietario_id
      JOIN usuarios u      ON u.id = m.extensionista_id
      LEFT JOIN predios pr ON pr.id = m.predio_id
      ${wM} GROUP BY u.nombre ORDER BY jornadas DESC
    `, valoresMarcacion)

    // ── Por comuna ───────────────────────────────────────────────────────────
    const comunaTalonario = await client.query(`
      SELECT p.comuna, COUNT(*)::int AS jornadas,
        COALESCE(ROUND(SUM(t.superficie_total_predio)::numeric, 2), 0) AS sup_total
      FROM talonario_terreno t
      JOIN propietarios p  ON p.id = t.propietario_id
      JOIN usuarios u      ON u.id = t.extensionista_id
      LEFT JOIN predios pr ON pr.id = t.predio_id
      ${wT} GROUP BY p.comuna ORDER BY jornadas DESC
    `, valoresTalonario)

    const comunaMarcacion = await client.query(`
      SELECT p.comuna, COUNT(*)::int AS jornadas,
        COALESCE(ROUND(SUM(m.superficie_total_predio)::numeric, 2), 0) AS sup_total
      FROM jornada_marcacion m
      JOIN propietarios p  ON p.id = m.propietario_id
      JOIN usuarios u      ON u.id = m.extensionista_id
      LEFT JOIN predios pr ON pr.id = m.predio_id
      ${wM} GROUP BY p.comuna ORDER BY jornadas DESC
    `, valoresMarcacion)

    // ── Actividades top 10 ───────────────────────────────────────────────────
    const actTalonarioTop = await client.query(`
      SELECT trim(both '"' from UNNEST(string_to_array(trim(both '{}' from t.actividades::text), ','))) AS actividad,
        COUNT(*)::int AS total
      FROM talonario_terreno t
      JOIN propietarios p  ON p.id = t.propietario_id
      JOIN usuarios u      ON u.id = t.extensionista_id
      LEFT JOIN predios pr ON pr.id = t.predio_id
      ${wT} GROUP BY actividad ORDER BY total DESC LIMIT 10
    `, valoresTalonario)

    const actMarcacionTop = await client.query(`
      SELECT trim(both '"' from UNNEST(string_to_array(trim(both '{}' from m.actividades::text), ','))) AS actividad,
        COUNT(*)::int AS total
      FROM jornada_marcacion m
      JOIN propietarios p  ON p.id = m.propietario_id
      JOIN usuarios u      ON u.id = m.extensionista_id
      LEFT JOIN predios pr ON pr.id = m.predio_id
      ${wM} GROUP BY actividad ORDER BY total DESC LIMIT 10
    `, valoresMarcacion)

    // ── Actividades detalle ──────────────────────────────────────────────────
    const actTalonarioDetalle = await client.query(`
      SELECT trim(both '"' from UNNEST(string_to_array(trim(both '{}' from t.actividades::text), ','))) AS actividad,
        COUNT(*)::int AS total
      FROM talonario_terreno t
      JOIN propietarios p  ON p.id = t.propietario_id
      JOIN usuarios u      ON u.id = t.extensionista_id
      LEFT JOIN predios pr ON pr.id = t.predio_id
      ${wT} GROUP BY actividad ORDER BY total DESC
    `, valoresTalonario)

    const actMarcacionDetalle = await client.query(`
      SELECT trim(both '"' from UNNEST(string_to_array(trim(both '{}' from m.actividades::text), ','))) AS actividad,
        COUNT(*)::int AS total
      FROM jornada_marcacion m
      JOIN propietarios p  ON p.id = m.propietario_id
      JOIN usuarios u      ON u.id = m.extensionista_id
      LEFT JOIN predios pr ON pr.id = m.predio_id
      ${wM} GROUP BY actividad ORDER BY total DESC
    `, valoresMarcacion)

    // ── Productos acumulados ─────────────────────────────────────────────────
    const productos = await client.query(`
      SELECT
        COALESCE(ROUND(SUM(t.lena_m3)::numeric, 2), 0)        AS lena_m3,
        COALESCE(ROUND(SUM(t.carbon_saco)::numeric, 2), 0)     AS carbon_saco,
        COALESCE(ROUND(SUM(t.madera_pulgada)::numeric, 2), 0)  AS madera_pulgada,
        COALESCE(ROUND(SUM(t.durmientes)::numeric, 2), 0)      AS durmientes,
        COALESCE(ROUND(SUM(t.metros_rumas)::numeric, 2), 0)    AS metros_rumas
      FROM talonario_terreno t
      JOIN propietarios p  ON p.id = t.propietario_id
      JOIN usuarios u      ON u.id = t.extensionista_id
      LEFT JOIN predios pr ON pr.id = t.predio_id
      ${wT}
    `, valoresTalonario)

    // ── KPIs visitas ─────────────────────────────────────────────────────────
    const kpiVisitas = await client.query(`
      SELECT
        COUNT(*)::int                                           AS total,
        COUNT(*) FILTER (WHERE v.estado = 'completada')::int   AS completadas,
        COUNT(*) FILTER (WHERE v.estado = 'pendiente')::int    AS pendientes,
        COUNT(*) FILTER (WHERE v.estado = 'cancelada')::int    AS canceladas,
        COUNT(DISTINCT v.propietario_id)::int                  AS propietarios_con_visita
      FROM visitass v
      JOIN usuarios u      ON u.id = v.extensionista_id
      JOIN propietarios p  ON p.id = v.propietario_id
      LEFT JOIN predios pr ON pr.id = v.predio_id
      ${wV}
    `, valoresVisitas)

    // ── Visitas por propietario ───────────────────────────────────────────────
    const visitasPorPropietario = await client.query(`
      SELECT
        p.id AS propietario_id, p.nombre AS propietario_nombre,
        p.rut, p.comuna, p.comunidad_indigena, p.comunidad_nombre,
        COUNT(*)::int AS total_visitas,
        COUNT(*) FILTER (WHERE v.estado = 'completada')::int AS completadas,
        COUNT(*) FILTER (WHERE v.estado = 'pendiente')::int  AS pendientes,
        COUNT(*) FILTER (WHERE v.estado = 'cancelada')::int  AS canceladas,
        MAX(v.fecha_visita)                                  AS ultima_visita,
        COUNT(DISTINCT v.extensionista_id)::int              AS extensionistas_distintos
      FROM visitass v
      JOIN propietarios p  ON p.id = v.propietario_id
      JOIN usuarios u      ON u.id = v.extensionista_id
      LEFT JOIN predios pr ON pr.id = v.predio_id
      ${wV}
      GROUP BY p.id, p.nombre, p.rut, p.comuna, p.comunidad_indigena, p.comunidad_nombre
      ORDER BY total_visitas DESC
    `, valoresVisitas)

    // ── Visitas por extensionista ─────────────────────────────────────────────
    const visitasPorExtensionista = await client.query(`
      SELECT
        u.nombre AS extensionista_nombre,
        COUNT(*)::int AS total_visitas,
        COUNT(*) FILTER (WHERE v.estado = 'completada')::int AS completadas,
        COUNT(*) FILTER (WHERE v.estado = 'pendiente')::int  AS pendientes,
        COUNT(*) FILTER (WHERE v.estado = 'cancelada')::int  AS canceladas,
        COUNT(DISTINCT v.propietario_id)::int                AS propietarios_visitados
      FROM visitass v
      JOIN usuarios u      ON u.id = v.extensionista_id
      JOIN propietarios p  ON p.id = v.propietario_id
      LEFT JOIN predios pr ON pr.id = v.predio_id
      ${wV}
      GROUP BY u.nombre ORDER BY total_visitas DESC
    `, valoresVisitas)

    // ── Actividades en visitas ────────────────────────────────────────────────
    const actividadesVisitas = await client.query(`
      SELECT v.actividad, COUNT(*)::int AS total
      FROM visitass v
      JOIN usuarios u      ON u.id = v.extensionista_id
      JOIN propietarios p  ON p.id = v.propietario_id
      LEFT JOIN predios pr ON pr.id = v.predio_id
      ${wV ? wV + ' AND' : 'WHERE'} v.actividad IS NOT NULL
      GROUP BY v.actividad ORDER BY total DESC LIMIT 10
    `, valoresVisitas)

    // ── Predios más activos ───────────────────────────────────────────────────
    const prediosTalonario = await client.query(`
      SELECT pr.id, pr.nombre AS predio_nombre, pr.rol,
        COUNT(*)::int AS jornadas,
        COALESCE(ROUND(SUM(t.superficie_total_predio)::numeric, 2), 0) AS sup_total
      FROM talonario_terreno t
      JOIN propietarios p  ON p.id = t.propietario_id
      JOIN usuarios u      ON u.id = t.extensionista_id
      JOIN predios pr      ON pr.id = t.predio_id
      ${wT} GROUP BY pr.id, pr.nombre, pr.rol ORDER BY jornadas DESC
    `, valoresTalonario)

    const prediosMarcacion = await client.query(`
      SELECT pr.id, pr.nombre AS predio_nombre, pr.rol,
        COUNT(*)::int AS jornadas,
        COALESCE(ROUND(SUM(m.superficie_total_predio)::numeric, 2), 0) AS sup_total
      FROM jornada_marcacion m
      JOIN propietarios p  ON p.id = m.propietario_id
      JOIN usuarios u      ON u.id = m.extensionista_id
      JOIN predios pr      ON pr.id = m.predio_id
      ${wM} GROUP BY pr.id, pr.nombre, pr.rol ORDER BY jornadas DESC
    `, valoresMarcacion)

    const prediosVisitas = await client.query(`
      SELECT pr.id, pr.nombre AS predio_nombre, pr.rol,
        COUNT(*)::int AS visitas
      FROM visitass v
      JOIN usuarios u  ON u.id = v.extensionista_id
      JOIN propietarios p ON p.id = v.propietario_id
      JOIN predios pr  ON pr.id = v.predio_id
      ${wV} GROUP BY pr.id, pr.nombre, pr.rol ORDER BY visitas DESC
    `, valoresVisitas)

    // ── Lista de predios para filtro ──────────────────────────────────────────
    const lstPredios = await client.query(`
      SELECT DISTINCT id, nombre FROM predios
      WHERE nombre IS NOT NULL ORDER BY nombre
    `)

    // ── Listas para filtros ───────────────────────────────────────────────────
    const lstExtensionistas = await client.query(`
      SELECT DISTINCT u.nombre FROM talonario_terreno t JOIN usuarios u ON u.id = t.extensionista_id WHERE u.nombre IS NOT NULL
      UNION
      SELECT DISTINCT u.nombre FROM jornada_marcacion m JOIN usuarios u ON u.id = m.extensionista_id WHERE u.nombre IS NOT NULL
      UNION
      SELECT DISTINCT u.nombre FROM visitass v JOIN usuarios u ON u.id = v.extensionista_id WHERE u.nombre IS NOT NULL
      ORDER BY nombre
    `)

    const lstComunas = await client.query(`
      SELECT DISTINCT p.comuna FROM talonario_terreno t JOIN propietarios p ON p.id = t.propietario_id WHERE p.comuna IS NOT NULL
      UNION
      SELECT DISTINCT p.comuna FROM jornada_marcacion m JOIN propietarios p ON p.id = m.propietario_id WHERE p.comuna IS NOT NULL
      UNION
      SELECT DISTINCT p.comuna FROM visitass v JOIN propietarios p ON p.id = v.propietario_id WHERE p.comuna IS NOT NULL
      ORDER BY comuna
    `)

    const lstPropietarios = await client.query(`
      SELECT DISTINCT id, nombre FROM propietarios WHERE nombre IS NOT NULL ORDER BY nombre
    `)

    const lstComunidades = await client.query(`
      SELECT DISTINCT comunidad_nombre FROM propietarios
      WHERE comunidad_indigena = true AND comunidad_nombre IS NOT NULL ORDER BY comunidad_nombre
    `)

    // ── Combinar resultados ───────────────────────────────────────────────────
    const kT = kpiTalonario.rows[0]
    const kM = kpiMarcacion.rows[0]
    const kpis = {
      total:           (kT.total || 0) + (kM.total || 0),
      talonarios:      kT.total || 0,
      marcaciones:     kM.total || 0,
      propietarios:    (kT.propietarios || 0) + (kM.propietarios || 0),
      sup_total:       ((+kT.sup_total || 0) + (+kM.sup_total || 0)).toFixed(2),
      sup_planificada: ((+kT.sup_planificada || 0) + (+kM.sup_planificada || 0)).toFixed(2),
      sup_ejecutada:   ((+kT.sup_ejecutada || 0) + (+kM.sup_ejecutada || 0)).toFixed(2),
    }

    const mesesMap = {}
    porMesTalonario.rows.forEach(r => { mesesMap[r.mes] = { mes: r.mes, talonarios: r.total, marcaciones: 0 } })
    porMesMarcacion.rows.forEach(r => {
      if (mesesMap[r.mes]) mesesMap[r.mes].marcaciones = r.total
      else mesesMap[r.mes] = { mes: r.mes, talonarios: 0, marcaciones: r.total }
    })
    const porMes = Object.values(mesesMap).sort((a, b) => a.mes.localeCompare(b.mes))

    const extMap = {}
    extTalonario.rows.forEach(r => {
      extMap[r.extensionista_nombre] = { extensionista_nombre: r.extensionista_nombre, jornadas: r.jornadas, propietarios: r.propietarios, sup_total: +r.sup_total || 0 }
    })
    extMarcacion.rows.forEach(r => {
      if (extMap[r.extensionista_nombre]) {
        extMap[r.extensionista_nombre].jornadas     += r.jornadas
        extMap[r.extensionista_nombre].propietarios += r.propietarios
        extMap[r.extensionista_nombre].sup_total    += +r.sup_total || 0
      } else {
        extMap[r.extensionista_nombre] = { extensionista_nombre: r.extensionista_nombre, jornadas: r.jornadas, propietarios: r.propietarios, sup_total: +r.sup_total || 0 }
      }
    })
    const porExtensionista = Object.values(extMap).sort((a, b) => b.jornadas - a.jornadas)

    const comunaMap = {}
    comunaTalonario.rows.forEach(r => { comunaMap[r.comuna] = { comuna: r.comuna, jornadas: r.jornadas, sup_total: +r.sup_total || 0 } })
    comunaMarcacion.rows.forEach(r => {
      if (comunaMap[r.comuna]) { comunaMap[r.comuna].jornadas += r.jornadas; comunaMap[r.comuna].sup_total += +r.sup_total || 0 }
      else comunaMap[r.comuna] = { comuna: r.comuna, jornadas: r.jornadas, sup_total: +r.sup_total || 0 }
    })
    const porComuna = Object.values(comunaMap).sort((a, b) => b.jornadas - a.jornadas)

    const actMap = {}
    actTalonarioTop.rows.forEach(r => { actMap[r.actividad] = (actMap[r.actividad] || 0) + r.total })
    actMarcacionTop.rows.forEach(r => { actMap[r.actividad] = (actMap[r.actividad] || 0) + r.total })
    const actividades = Object.entries(actMap).map(([actividad, total]) => ({ actividad, total })).sort((a, b) => b.total - a.total).slice(0, 10)

    const ACTIVIDADES_TALONARIO = [
      { value: 'recorrido_predial',          label: 'Recorrido predial' },
      { value: 'forestacion',                label: 'Forestación' },
      { value: 'interpretacion_ejecucion',   label: 'Interpretación ejecución plan de manejo' },
      { value: 'diseno_trazado_senderos',    label: 'Diseño y trazado de senderos' },
      { value: 'prevencion_incendios',       label: 'Prevención de Incendios Forestales' },
      { value: 'prevencion_seguridad',       label: 'Prevención y seguridad en faena forestal' },
      { value: 'medicion_volumenes',         label: 'Medición de volúmenes' },
      { value: 'comercializacion',           label: 'Comercialización' },
      { value: 'plan_secado_lena',           label: 'Plan de secado de leña' },
      { value: 'medicion_humedad_lena',      label: 'Medición y registro de % Humedad de Leña' },
      { value: 'seleccion_marcacion_bosque', label: 'Selección y marcación del bosque' },
      { value: 'seguimiento_ejecucion',      label: 'Seguimiento ejecución de actividades' },
      { value: 'costos_produccion',          label: 'Costos de producción y rendimientos' },
      { value: 'diversificacion_productivo', label: 'Diversificación y E. productivo' },
      { value: 'otro',                       label: 'Otro' },
    ]

    const ACTIVIDADES_MARCACION = [
      { value: 'supresion_de_especies_exoticas',    label: 'Supresión de Especies Exóticas' },
      { value: 'corta_liberacion',                  label: 'Corta de Liberación' },
      { value: 'raleo',                             label: 'Raleo' },
      { value: 'corta_sanitaria',                   label: 'Corta Sanitaria' },
      { value: 'renovacion_de_bosques',             label: 'Renovación de Bosques' },
      { value: 'podas',                             label: 'Podas' },
      { value: 'corte_de_maderables_no_maderables', label: 'Corte de Maderables y No Maderables' },
      { value: 'medidas_control_erosion',           label: 'Medidas de Control de Erosión' },
      { value: 'aplicacion_de_plaguicidas',         label: 'Aplicación de Plaguicidas' },
      { value: 'abonos',                            label: 'Abonos' },
      { value: 'deforestacion',                     label: 'Deforestación' },
      { value: 'siembra_y_resiembra',               label: 'Siembra y Resiembra' },
      { value: 'cortas_mayores',                    label: 'Cortas Mayores' },
      { value: 'actividades_otros',                 label: 'Otras' },
    ]

    const actTMap = {}
    actTalonarioDetalle.rows.forEach(r => { actTMap[r.actividad.trim()] = r.total })
    const actMMap = {}
    actMarcacionDetalle.rows.forEach(r => { actMMap[r.actividad.trim()] = r.total })

    const actividadesTalonario = ACTIVIDADES_TALONARIO.map(a => ({ label: a.label, value: a.value, total: actTMap[a.value] || 0 })).sort((a, b) => b.total - a.total)
    const actividadesMarcacion = ACTIVIDADES_MARCACION.map(a => ({ label: a.label, value: a.value, total: actMMap[a.value] || 0 })).sort((a, b) => b.total - a.total)

    // combinar predios
    const prediosMap = {}
    prediosTalonario.rows.forEach(r => {
      prediosMap[r.id] = { predio_nombre: r.predio_nombre, rol: r.rol, jornadas: r.jornadas, sup_total: +r.sup_total || 0, visitas: 0 }
    })
    prediosMarcacion.rows.forEach(r => {
      if (prediosMap[r.id]) { prediosMap[r.id].jornadas += r.jornadas; prediosMap[r.id].sup_total += +r.sup_total || 0 }
      else prediosMap[r.id] = { predio_nombre: r.predio_nombre, rol: r.rol, jornadas: r.jornadas, sup_total: +r.sup_total || 0, visitas: 0 }
    })
    prediosVisitas.rows.forEach(r => {
      if (prediosMap[r.id]) prediosMap[r.id].visitas = r.visitas
      else prediosMap[r.id] = { predio_nombre: r.predio_nombre, rol: r.rol, jornadas: 0, sup_total: 0, visitas: r.visitas }
    })
    const porPredio = Object.values(prediosMap).sort((a, b) => (b.jornadas + b.visitas) - (a.jornadas + a.visitas))

    return Response.json({
      kpis,
      porMes,
      porExtensionista,
      porComuna,
      porPredio,
      actividades,
      actividadesTalonario,
      actividadesMarcacion,
      productos:               productos.rows[0],
      extensionistas:          lstExtensionistas.rows.map(r => r.nombre),
      comunas:                 lstComunas.rows.map(r => r.comuna),
      propietarios:            lstPropietarios.rows,
      comunidades:             lstComunidades.rows.map(r => r.comunidad_nombre),
      predios:                 lstPredios.rows,
      kpiVisitas:              kpiVisitas.rows[0],
      visitasPorPropietario:   visitasPorPropietario.rows,
      visitasPorExtensionista: visitasPorExtensionista.rows,
      actividadesVisitas:      actividadesVisitas.rows,
    })

  } catch (error) {
    console.error('Error en /api/reportes:', error)
    return Response.json({ error: error.message }, { status: 500 })
  } finally {
    client.release()
  }
}