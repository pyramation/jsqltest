import { TestConnection } from '../src';
import env from '../utils/env';

let conn;
const objs = {};

beforeAll(async () => {
  conn = new TestConnection({ database: env.PGDATABASE });
  await conn.connect();
  await conn.begin();
  await conn.query(`
    create table public.blog_post (
       id serial primary key,
       header text,
       body text
     );
  `);
});

afterAll(async () => {
  await conn.rollback();
  await conn.teardown();
});

// beforeEach(async () => {
//   await conn.steamSql(`
//     create table public.blog_post (
//       id serial primary key,
//       header text,
//       body text
//     );
//     `);
// });

it('creates objects', async () => {
  const post = await conn.db.insertOne('public.blog_post', {
    header: 'title',
    body: 'here is my post'
  });
  console.log(post);
  expect(post).toBeTruthy();
});
