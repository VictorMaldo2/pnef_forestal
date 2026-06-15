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
        email:    { label: 'Correo electrónico', type: 'email',    placeholder: 'usuario@ejemplo.com' },
        password: { label: 'Contraseña',         type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const client = await pool.connect()
        try {
          const res = await client.query(
            `SELECT au.id, au.email, au.hashed_password, u.nombre, u.role_id
             FROM auth_users au
             JOIN usuarios u ON u.id::text = au.id::text
             WHERE au.email = $1`,
            [credentials.email]
          )

          console.log('FILAS ENCONTRADAS:', res.rowCount)
          console.log('USUARIO:', res.rows[0])

          if (res.rowCount === 0) {
            console.log('Usuario no encontrado')
            return null
          }

          const user     = res.rows[0]
          const isValid  = await bcrypt.compare(credentials.password, user.hashed_password)
          console.log('PASSWORD VALIDO:', isValid)

          if (!isValid) return null

          return {
            id:     user.id,
            name:   user.nombre,
            email:  user.email,
            roleId: user.role_id
          }
        } catch (err) {
          console.error('Error en authorize:', err)
          return null
        } finally {
          client.release()
        }
      }
    })
  ],

  session: {
    strategy:  'jwt',
    maxAge:    8 * 60 * 60,
    updateAge: 60 * 60,
  },

  jwt: {
    maxAge: 8 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id     = user.id
        token.roleId = user.roleId
      }
      return token
    },
    async session({ session, token }) {
      session.user.id     = token.id
      session.user.roleId = token.roleId
      return session
    }
  },

  pages: {
    signIn: '/login'
  },

  secret:    process.env.NEXTAUTH_SECRET,
  trustHost: true,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }