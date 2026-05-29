import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: '/admin/login',
  },
})

export const config = {
  matcher: ['/admin/dashboard/:path*', '/admin/pedidos/:path*', '/admin/productos/:path*'],
}
