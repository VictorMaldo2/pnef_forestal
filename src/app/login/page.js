'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'

const ERRORES_AMIGABLES = {
  CredentialsSignin: 'Correo o contraseña incorrectos',
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.roleId) {
      if (session.user.roleId === 1) router.push('/admin')
      else if (session.user.roleId === 2) router.push('/extensionista')
      else {
        setTimeout(() => {
          setError('Rol de usuario no reconocido')
        }, 0)
      }
    }
  }, [session, router])

  async function handleLogin(e) {
    e.preventDefault()
    setError('')

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password
    })

    if (res.error) {
      setError(ERRORES_AMIGABLES[res.error] || 'Error al iniciar sesión. Intenta nuevamente.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Fondo decorativo */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-10 lg:p-12">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg border-4 border-white/60">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-green-900 bg-clip-text text-transparent mb-4 leading-tight">
              Plataforma PNEF Forestal
            </h1>
            <p className="text-gray-700 text-sm sm:text-base lg:text-lg font-medium max-w-md mx-auto">
              Inicia sesión con tus credenciales
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm sm:text-base font-medium shadow-sm animate-pulse">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="usuario@conaf.cl"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/30 focus:border-green-500 bg-white/50 backdrop-blur-sm text-sm sm:text-base text-gray-800 placeholder-gray-400 shadow-inner transition-all duration-300 hover:border-green-300"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/30 focus:border-green-500 bg-white/50 backdrop-blur-sm text-sm sm:text-base text-gray-800 placeholder-gray-400 shadow-inner transition-all duration-300 hover:border-green-300"
                />
              </div>
            </div>

            {/* Botón submit */}
            <button
              type="submit"
              className="group relative overflow-hidden w-full bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white py-5 px-8 rounded-2xl font-bold text-lg sm:text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-500 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-green-500/50"
            >
              <div className="absolute inset-0 bg-white/20 skew-x-12 -rotate-3 group-hover:rotate-0 transition-transform duration-700 -z-10"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Entrar al Sistema
                <svg className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-green-100 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              © 2026 Plataforma PNEF Forestal
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}