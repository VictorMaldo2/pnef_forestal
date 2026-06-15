import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token  = req.nextauth.token
    const path   = req.nextUrl.pathname

    // Si intenta acceder a /admin sin ser admin → redirige a /extensionista
    if (path.startsWith('/admin') && token?.roleId !== 1) {
      return NextResponse.redirect(new URL('/extensionista', req.url))
    }

    // Si intenta acceder a /extensionista siendo admin → redirige a /admin
    if (path.startsWith('/extensionista') && token?.roleId === 1) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token  // si no hay token → redirige a /login
    }
  }
)

export const config = {
  matcher: ['/admin/:path*', '/extensionista/:path*']
}