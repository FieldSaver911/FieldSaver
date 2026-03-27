import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable UUID generation
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  // ── users ──────────────────────────────────────────────────────────────────
  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('email', 320).notNullable().unique();
    t.text('password_hash').notNullable();
    t.string('name', 200).notNullable();
    t.string('role', 20).notNullable().defaultTo('editor');
    t.text('monday_access_token').nullable(); // AES-256 encrypted
    t.string('monday_account_id', 100).nullable();
    t.timestamps(true, true);
    t.timestamp('deleted_at').nullable();
    t.index('role');
  });

  // ── libraries ──────────────────────────────────────────────────────────────
  await knex.schema.createTable('libraries', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name', 200).notNullable();
    t.string('icon', 20).notNullable().defaultTo('📚');
    t.text('description').defaultTo('');
    t.string('color', 20).defaultTo('#0073EA');
    t.string('version', 20).defaultTo('1.0');
    t.string('source', 30).notNullable().defaultTo('custom');
    t.string('monday_board_id', 100).nullable();
    t.jsonb('columns').notNullable().defaultTo('[]');
    t.specificType('categories', 'text[]').defaultTo('{}');
    t.specificType('sub_categories', 'text[]').defaultTo('{}');
    t.jsonb('permissions').notNullable().defaultTo('{"canView":["admin","editor","viewer"],"canEdit":["admin","editor"],"canDelete":["admin"]}');
    t.boolean('is_system').defaultTo(false);
    t.uuid('created_by').nullable().references('id').inTable('users');
    t.timestamps(true, true);
    t.timestamp('deleted_at').nullable();
    t.index('created_by');
    t.index('source');
    t.index('is_system');
  });

  // ── library_rows ───────────────────────────────────────────────────────────
  await knex.schema.createTable('library_rows', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('library_id').notNullable().references('id').inTable('libraries');
    t.string('label', 500).notNullable();
    t.string('code', 50).defaultTo('');
    t.string('export_key', 500).notNullable().defaultTo('');
    t.text('description').defaultTo('');
    t.string('category', 100).defaultTo('');
    t.string('sub_category', 100).defaultTo('');
    t.string('usage', 50).defaultTo('Optional');
    t.string('element_id', 100).defaultTo('');
    t.integer('sort_order').defaultTo(0);
    t.timestamps(true, true);
    t.timestamp('deleted_at').nullable();
    t.index('library_id');
    t.index('category');
    t.index('export_key');
    t.index(['library_id', 'category', 'deleted_at']);
  });

  // ── forms ──────────────────────────────────────────────────────────────────
  await knex.schema.createTable('forms', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users');
    t.string('name', 200).notNullable().defaultTo('Untitled Form');
    t.text('description').defaultTo('');
    t.jsonb('data').notNullable().defaultTo('{"pages":[],"libraries":[],"narrativeTemplates":[]}');
    t.jsonb('settings').notNullable().defaultTo('{}');
    t.string('status', 20).notNullable().defaultTo('draft');
    t.timestamp('published_at').nullable();
    t.integer('version').notNullable().defaultTo(1);
    t.timestamps(true, true);
    t.timestamp('deleted_at').nullable();
    t.index('user_id');
    t.index('status');
    t.index(['user_id', 'status', 'deleted_at']);
  });

  // GIN index on forms.data for JSONB queries
  await knex.raw('CREATE INDEX forms_data_gin ON forms USING GIN (data)');

  // ── narrative_templates ────────────────────────────────────────────────────
  await knex.schema.createTable('narrative_templates', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('form_id').notNullable().references('id').inTable('forms');
    t.string('name', 200).notNullable();
    t.text('content').notNullable().defaultTo('');
    t.integer('sort_order').defaultTo(0);
    t.timestamps(true, true);
    t.index('form_id');
  });

  // ── submissions ────────────────────────────────────────────────────────────
  await knex.schema.createTable('submissions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('form_id').notNullable().references('id').inTable('forms');
    t.integer('form_version').notNullable();
    t.jsonb('data').notNullable().defaultTo('{}');
    t.jsonb('export_data').notNullable().defaultTo('{}');
    t.jsonb('not_values').notNullable().defaultTo('{}');
    t.uuid('submitted_by').nullable().references('id').inTable('users');
    t.timestamp('submitted_at').notNullable().defaultTo(knex.fn.now());
    t.string('source', 20).defaultTo('web');
    t.string('monday_item_id', 100).nullable();
    t.timestamps(true, true);
    t.index('form_id');
    t.index('submitted_at');
    t.index(['form_id', 'submitted_at']);
  });

  // ── refresh_tokens ─────────────────────────────────────────────────────────
  await knex.schema.createTable('refresh_tokens', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users');
    t.string('token_hash', 64).notNullable().unique();
    t.timestamp('expires_at').notNullable();
    t.timestamp('revoked_at').nullable();
    t.timestamps(true, true);
    t.index('user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('submissions');
  await knex.schema.dropTableIfExists('narrative_templates');
  await knex.schema.dropTableIfExists('forms');
  await knex.schema.dropTableIfExists('library_rows');
  await knex.schema.dropTableIfExists('libraries');
  await knex.schema.dropTableIfExists('users');
}
