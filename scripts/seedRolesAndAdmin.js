const { sequelize } = require('../models');
const { Role, User } = require('../models');

async function seedRolesAndAdmin() {
  try {
    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
      // Create roles
      const [adminRole, userRole] = await Promise.all([
        Role.create({ name: 'ADMIN' }, { transaction }),
        Role.create({ name: 'USER' }, { transaction })
      ]);

      console.log('Roles created successfully');

      // Create admin user with plain text password (for development only)
      const adminUser = await User.create({
        name: 'alangarcia',
        email: 'alangarciacamina@gmail.com',
        password: 'admin', // In production, this should be hashed
        roleId: adminRole.id
      }, { transaction });

      console.log('Admin user created successfully');
      console.log('Admin user details:', {
        name: adminUser.name,
        email: adminUser.email,
        role: 'ADMIN'
      });

      // Commit the transaction
      await transaction.commit();
      console.log('Database seeding completed successfully');
    } catch (error) {
      // If there's an error, rollback the transaction
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedRolesAndAdmin(); 