// lib/db.js
import { Pool } from 'pg'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
})

pool.on('connect', () => console.log('🟢 Connected to PostgreSQL'))
pool.on('error', e => console.error('🔴 PostgreSQL error', e))