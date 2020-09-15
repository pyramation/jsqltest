import pgPromise from 'pg-promise';
import { parse } from 'pg-connection-string';
import env from './env';
import { PgpWrapper, wrapConn } from './stmts';
import { streamSql } from './utils';
import { createdb, dropdb, installExt } from './utils/db';

const pgp = pgPromise({
  noWarnings: true
});

const getDbString = (dbname) =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${dbname}`;

const connect = async (connection) => {
  const cn = await pgp(connection);
  const db = await cn.connect({ direct: true });
  const wrapped = new PgpWrapper(db);
  return wrapConn(wrapped);
};

const getConfig = ({
  user = env.PGUSER,
  port = env.PGPORT,
  host = env.PGHOST,
  password = env.PGPASSWORD,
  database
} = {}) => ({
  user,
  port,
  host,
  password,
  database
});

// this just does a basic rollback
export class TestConnection {
  constructor(connection = {}) {
    if (typeof connection === 'string') {
      this.config = parse(connection);
    } else {
      this.config = getConfig(connection);
    }
  }
  async connect() {
    this.db = await connect(this.config);
  }
  async steamSql(sql) {
    await streamSql(this.config, sql);
  }
  async teardown() {
    this.db.done();
  }
  async begin() {
    await this.db.any(`BEGIN;`);
    await this.db.any(`SAVEPOINT jsqltest;`);
  }
  async query(sql) {
    await this.db.any(sql);
  }
  async rollback() {
    await this.db.any(`ROLLBACK TO SAVEPOINT jsqltest;`);
    await this.db.any(`COMMIT;`);
  }
}

function getDatabaseName(dbname) {
  return dbname + '-' + Date.now();
}

// this creates a db, and then enables just does a basic rollbacks
export class TestDatabase {
  constructor(connection = {}) {
    if (typeof connection === 'string') {
      this.config = parse(connection);
    } else {
      this.config = getConfig(connection);
    }
    // override database for test name
    this.config.database = getDatabaseName(this.config.database);
  }
  async createdb() {
    await createdb(this.config);
  }
  async installExt(extensions) {
    await installExt(this.config, extensions);
  }
  async connect() {
    this.db = await connect(this.config);
  }
  async seed(sql) {
    await streamSql(this.config, sql);
  }
  ensuredb() {
    if (!this.db) {
      throw new Error('there is no db object');
    }
  }
  async teardown() {
    this.ensuredb();
    this.db.done();
    await dropdb(this.config);
  }
  async begin() {
    await this.query(`BEGIN;`);
    await this.query(`SAVEPOINT jsqltest;`);
  }
  async query(sql) {
    this.ensuredb();
    await this.db.any(sql);
  }
  async rollback() {
    await this.query(`ROLLBACK TO SAVEPOINT jsqltest;`);
    await this.query(`COMMIT;`);
  }
}
