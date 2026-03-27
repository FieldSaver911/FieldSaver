import Knex from 'knex';
import knexStringcase from 'knex-stringcase';
import config from '../../knexfile';

const env = (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development';

export const db = Knex(knexStringcase(config[env]));

export default db;
