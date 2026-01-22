
import { PrismaClient, UserRole } from '@prisma/client';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@saber.co';
  
  console.log(`🛡️ Creating Admin User (${adminEmail})...`);

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (existing) {
    if (existing.role === UserRole.admin) {
        console.log('✅ Admin already exists.');
        return;
    }
    // Promote
    await prisma.user.update({
        where: { id: existing.id },
        data: { role: UserRole.admin }
    });
    console.log('✅ Existing user promoted to Admin.');
    return;
  }

  // Create new
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'System Admin',
      role: UserRole.admin,
      photo_url: faker.image.avatar(),
    }
  });

  console.log(`✅ Admin created with ID: ${admin.id}`);
  console.log('⚠️  NOTE: Login via OAuth and ensure email matches, or use this ID for token generation.');
}

createAdmin()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
