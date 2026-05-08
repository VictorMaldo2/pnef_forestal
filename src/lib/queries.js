// lib/auth.js
import { pool } from './db'
import bcrypt from 'bcrypt'

export async function findUserByEmail(email) {
  const res = await pool.query('SELECT * FROM auth_users WHERE email = $1', [email])
  return res.rows[0] || null
}

export async function createUser({ email, passwordHash, nombre, roleId }) {
  const res = await pool.query(
    'INSERT INTO auth_users (id, email, hashed_password, nombre, role_id) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *',
    [email, passwordHash, nombre, roleId]
  )
  return res.rows[0]
}

export async function getUsuarios() {
  const { rows } = await pool.query('SELECT id, email, nombre, created_at FROM auth_users ORDER BY created_at DESC')
  return rows
}