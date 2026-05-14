import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Correo electrónico', type: 'email', placeholder: 'usuario@ejemplo.com' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const client = await pool.connect()
        try {
          const res = await client.query(
            'SELECT id, nombre, email, hashed_password, role_id FROM auth_users WHERE email = $1',
            [credentials.email]
          )
          if (res.rowCount === 0) return null

          const user = res.rows[0]
          const isValid = await bcrypt.compare(credentials.password, user.hashed_password)
          if (!isValid) return null

          return {
            id: user.id,
            name: user.nombre,
            email: user.email,
            roleId: user.role_id
          }
        } finally {
          client.release()
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.roleId = user.roleId
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.roleId = token.roleId
      return session
    }
  },
  pages: {
    signIn: '/login' // Página personalizada de login
  },
  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }