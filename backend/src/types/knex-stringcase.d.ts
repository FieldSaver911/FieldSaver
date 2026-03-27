// Ambient module declaration for knex-stringcase, which has no published types.
// It wraps a Knex config and returns a config with camelCase↔snake_case conversion.
declare module 'knex-stringcase' {
  import type { Knex } from 'knex';
  function knexStringcase(config: Knex.Config): Knex.Config;
  export = knexStringcase;
}
