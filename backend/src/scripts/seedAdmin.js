const bcrypt = require('bcryptjs');
const User = require('../models/User.model');

const ADMIN_EMAIL = 'admin@zoo.lk';
const ADMIN_PASSWORD = 'admin123';

async function seedAdminUser() {
  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase().trim() });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log('[seedAdmin] Existing account promoted to admin role.');
    } else {
      console.log('[seedAdmin] Admin account already exists.');
    }
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({
    fullName: 'System Admin',
    email: ADMIN_EMAIL,
    phone: '0000000000',
    password: hashed,
    role: 'admin',
  });
  console.log('[seedAdmin] Seeded admin account: admin@zoo.lk');
}

module.exports = { seedAdminUser, ADMIN_EMAIL };
