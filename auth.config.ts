import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { AuthService } from './lib/services/auth-service'

export default {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await AuthService.getInstance().login(credentials.email as string, credentials.password as string)

        // const user = await prisma.user.findUnique({
        //   where: { email: credentials.email as string },
        // })

        // if (!user) return null

        // const passwordMatch = await bcrypt.compare(credentials.password as string, user.password)
        // if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: 'ADMIN', //user.role
          access_token: user.token, 
          employee_id: user.employee_id
        }
      },
    }),
  ]
}
