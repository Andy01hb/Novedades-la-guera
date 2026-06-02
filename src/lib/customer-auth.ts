import 'server-only'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

if (!process.env.CUSTOMER_NEXTAUTH_SECRET) {
  throw new Error('CUSTOMER_NEXTAUTH_SECRET env var is not set')
}

export const customerAuthOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const customer = await prisma.customer.findUnique({
          where: { email: credentials.email },
        })

        if (!customer || !customer.password) return null

        const match = await bcrypt.compare(credentials.password, customer.password)
        if (!match) return null

        return { id: customer.id, email: customer.email, name: customer.name, image: customer.image }
      },
    }),
  ],
  pages: {
    signIn: '/cuenta/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const existing = await prisma.customer.findUnique({ where: { email: user.email! } })
        if (!existing) {
          await prisma.customer.create({
            data: {
              id: user.id,
              email: user.email!,
              name: user.name ?? '',
              image: user.image,
              provider: 'google',
              providerId: account.providerAccountId,
            },
          })
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === 'google') {
          const customer = await prisma.customer.findUnique({ where: { email: user.email! } })
          token.customerId = customer?.id ?? user.id
        } else {
          token.customerId = user.id
        }
        token.name = user.name
        token.email = user.email
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.customerId as string
      }
      return session
    },
  },
  secret: process.env.CUSTOMER_NEXTAUTH_SECRET,
}
