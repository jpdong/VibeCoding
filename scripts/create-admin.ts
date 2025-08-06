import { db } from '../src/lib/db';

interface AdminUser {
  email: string;
  name: string;
  isAdmin: boolean;
}

const ADMIN_USERS: AdminUser[] = [
  {
    email: 'admin@vibecoding.com',
    name: 'Admin User',
    isAdmin: true,
  },
  // Add more admin users as needed
];

async function createAdminUsers() {
  try {
    console.log('🔧 Creating admin users...');

    for (const adminUser of ADMIN_USERS) {
      try {
        // Check if user already exists
        const existingUser = await db.getUserByEmail(adminUser.email);
        
        if (existingUser) {
          console.log(`👤 Admin user ${adminUser.email} already exists`);
          
          // Update admin status if needed
          await db.query(
            'UPDATE users SET is_admin = $1, updated_at = NOW() WHERE email = $2',
            [adminUser.isAdmin, adminUser.email]
          );
          
          console.log(`✅ Updated admin status for ${adminUser.email}`);
        } else {
          // Create new admin user
          const newUser = await db.createUser({
            email: adminUser.email,
            name: adminUser.name,
          });

          // Set admin status
          await db.query(
            'UPDATE users SET is_admin = $1, updated_at = NOW() WHERE id = $2',
            [adminUser.isAdmin, newUser.id]
          );

          console.log(`✅ Created admin user: ${adminUser.email}`);
        }
      } catch (error) {
        console.error(`❌ Failed to create admin user ${adminUser.email}:`, error);
      }
    }

    console.log('🎉 Admin user creation completed!');
  } catch (error) {
    console.error('💥 Admin user creation failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createAdminUsers()
    .then(() => {
      console.log('Admin setup finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Admin setup failed:', error);
      process.exit(1);
    });
}

export { createAdminUsers };