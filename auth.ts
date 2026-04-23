import NextAuth from 'next-auth'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import authConfig from './auth.config'

export const { auth, handlers, signIn, signOut } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: 'jwt' },
    ...authConfig,
    callbacks: {
        async jwt({ token, user }) {
        if (user) {
            token.role = (user as { role: string }).role
            token.id = user.id
        }
        return token
        },
        async session({ session, token }) {
        if (session.user) {
            (session.user as unknown as { role: string; id: string }).role = token.role as string
            (session.user as unknown as { id: string }).id = token.id as string
        }
        return session
        },
    },
    pages: {
        signIn: '/login',
    },
})