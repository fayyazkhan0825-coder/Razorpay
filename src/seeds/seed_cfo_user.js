const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Clear the table and reset the identity sequence
  await knex.raw('TRUNCATE TABLE users RESTART IDENTITY CASCADE');

  const passwordHash = await bcrypt.hash('CFO#ORG@April2026', 10);

  await knex('users').insert({
    name: 'CFO Root User',
    email: 'cfo@org.com',
    password_hash: passwordHash,
    role: 'CFO'
  });
};
