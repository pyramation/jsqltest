# jsqltest

Meant for testing within `sqitch` or `launchql` projects

Example:

```js
import cases from 'jest-in-case';
import { TestDatabase } from 'jsqltest';
import { resolve as resolveSql } from '@launchql/db-utils';
jest.setTimeout(30000);

let teardown, db, conn;
const objs = {};

beforeAll(async () => {
  const sql = await resolveSql(__dirname + '/../', 'deploy');
  conn = new TestDatabase({ database: 'my-first-test' });
  await conn.createdb();
  await conn.installExt(conn.config, [
    'plpgsql', 'uuid-ossp', 'pgcrypto', 'citext', 'hstore'
  ])
  await conn.seed(sql);
  await conn.connect();
});

beforeEach(async () => {
  await conn.begin();
});

afterEach(async () => {
  await conn.rollback();
});

afterAll(async () => {
  await conn.teardown();
});

cases(
  'jsqltest(header)',
  async (opts) => {
    const post = await conn.db.insertOne('app_public.my_table', {
      header: opts.header,
      body: 'here is my post'
    });
    expect(post).toBeTruthy();
  },
  [
    { header: 'title1' },
    { header: 'title2' },
    { header: 'title3' },
    { header: 'title4' },
    { header: 'title5' },
    { header: 'title6' },
    { header: 'title7' },
    { header: 'title8' },
    { header: 'title9' },
    { header: 'title10' },
    { header: 'title11' },
    { header: 'title12' },
    { header: 'title13' },
    { header: 'title14' },
    { header: 'title15' },
    { header: 'title16' }
  ]
);

```