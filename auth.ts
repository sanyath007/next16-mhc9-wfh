import NextAuth from 'next-auth'
import authConfig from './auth.config'

export const { auth, handlers, signIn, signOut } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: 'jwt' },
    ...authConfig,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = (user as { role: string }).role
                token.access_token = user.access_token
                token.employee_id = user.employee_id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as unknown as { id: string }).id = token.id as string
                (session.user as unknown as { employee_id: string }).employee_id = token.employee_id as string
                (session.user as unknown as { role: string; id: string }).role = token.role as string
                (session.user as unknown as { access_token: string }).access_token = token.access_token as string
            }
            return session
        },
    },
    pages: {
        signIn: '/login',
    },
})