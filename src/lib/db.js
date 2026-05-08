// lib/db.js
import { Pool } from 'pg'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in .env')
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
})

pool.on('connect', () => console.log('🟢 Connected to PostgreSQL'))
pool.on('error', e => console.error('🔴 PostgreSQL error', e))