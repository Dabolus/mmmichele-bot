import path from 'path';
import { promises as fs } from 'fs';

export const cacheDirectory = path.join(
  __dirname,
  '../node_modules/.cache/mmmichele',
);

export const cacheFile = path.join(cacheDirectory, 'cache.json');

export const initialize = async (): Promise<void> => {
  await fs.mkdir(cacheDirectory, { recursive: true });
  await fs
    .writeFile(cacheFile, '{}', { flag: 'wx', encoding: 'utf8' })
    .catch(() => null);
};

export const set = async <T = unknown>(
  key: string,
  value: T,
): Promise<void> => {
  const previousCache = JSON.parse(await fs.readFile(cacheFile, 'utf8'));

  await fs.writeFile(
    cacheFile,
    JSON.stringify({
      ...previousCache,
      [key]: value,
    }),
  );
};

export const get = async <T = unknown>(key: string): Promise<T | null> => {
  const cache = JSON.parse(await fs.readFile(cacheFile, 'utf8'));

  return cache[key] ?? null;
};
