import { PrismaClient, UserStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default admin role
  const adminRole = await prisma.userRole.create({
    data: {
      slug: 'admin',
      name: 'Administrator',
      description: 'System Administrator',
      isProtected: true,
      isDefault: false,
    },
  })

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@uddoog.com',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // 'password123'
      name: 'System Admin',
      roleId: adminRole.id,
      status: UserStatus.ACTIVE,
      isProtected: true,
    },
  })

  // Create default system settings
  await prisma.systemSetting.create({
    data: {
      name: 'Uddoog',
      supportEmail: 'support@uddoog.com',
      language: 'en',
      timezone: 'UTC',
      currency: 'USD',
    },
  })

  console.log('Seed data created:', { adminUser, adminRole })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 