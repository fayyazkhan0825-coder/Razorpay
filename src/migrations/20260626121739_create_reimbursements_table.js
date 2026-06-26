/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('reimbursements', (table) => {
    table.increments('id').primary();
    table.integer('employee_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description');
    table.decimal('amount', 14, 2).notNullable();
    table.integer('rm_id').unsigned().notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.integer('ape_id').unsigned().notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.string('rm_approval_status').notNullable().defaultTo('PENDING');
    table.string('ape_approval_status').notNullable().defaultTo('PENDING');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('reimbursements');
};
