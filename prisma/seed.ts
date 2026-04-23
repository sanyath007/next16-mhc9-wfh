import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'ผู้ดูแลระบบ',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {},
    create: {
      email: 'editor@example.com',
      name: 'เจ้าหน้าที่ข้อมูล',
      password: await bcrypt.hash('editor123', 12),
      role: 'EDITOR',
    },
  })

  await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      name: 'ผู้ดูข้อมูล',
      password: await bcrypt.hash('viewer123', 12),
      role: 'VIEWER',
    },
  })

  console.log('✅ Users created')

  // Note: CSV seeding is disabled due to schema changes
  // The new normalized schema requires location lookup/creation during upload
  // Use the upload API endpoint instead for seeding data

  console.log('🎉 Seed complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
