import cases from 'jest-in-case';
import { TestDatabase } from '../src';
import env from '../utils/env';
jest.setTimeout(30000);

let conn;
const objs = {};

beforeAll(async () => {
  conn = new TestDatabase({ database: env.PGDATABASE });
  await conn.createdb();
  await conn.seed(`
    create table public.blog_post (
        id serial primary key,
        header text,
        body text
        );
        `);

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
    const post = await conn.db.insertOne('public.blog_post', {
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
