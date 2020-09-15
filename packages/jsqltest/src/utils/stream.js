import Streamify from 'streamify-string';
import { spawn } from 'child_process';

const setArgs = (config) => {
  let args = [];

  args = Object.entries({
    '-U': config.user,
    '-h': config.host,
    '-p': config.port
  }).reduce((args, [key, value]) => {
    if (value) args.push(key, `${value}`);
    return args;
  }, args);

  if (config.database) args.push(config.database);
  return args;
};

export const streamSql = (config, sql = '') => {
  const args = setArgs(config);
  return new Promise((resolve, reject) => {
    const str = new Streamify(sql);
    const proc = spawn('psql', args, {
      env: {
        PGPASSWORD: config.password,
        PGUSER: config.user,
        PGHOST: config.host,
        PGPORT: config.port,
        PATH: process.env.PATH
      }
    });
    str.pipe(proc.stdin);
    proc.on('close', (code) => {
      resolve();
    });

    proc.on('error', (error) => {
      reject(error);
    });

    proc.stderr.on('data', (data) => {
      reject(data.toString());
    });
  });
};
