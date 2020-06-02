import { createReadStream, createWriteStream, promises } from 'fs';
import { resolve } from 'url';
import { join } from 'path';
import { get } from 'https';
import { Extract } from 'unzipper';

import { Target, targets } from './targets';

const { mkdir, unlink } = promises;

const revision = process.argv[2];
const baseUrl =
  'https://www.googleapis.com/download/storage/v1/b/chromium-browser-snapshots/o/';

const getUrl = (target: Target) =>
  resolve(
    baseUrl,
    `${target.prefix}%2F${revision}%2F${target.name}.zip?alt=media`
  );

const baseDirectory = join(process.cwd(), 'chromium');
const getArchivePath = (target: Target) =>
  join(baseDirectory, `${target.name}.zip`);

const download = (from: string, to: string) =>
  new Promise<void>((resolve) => {
    const stream = createWriteStream(to);

    get(from, (response) => {
      response.pipe(stream);
      response.on('end', () => {
        stream.end();
        resolve();
      });
    });
  });

const unzip = (from: string, to: string) =>
  new Promise((resolve, reject) => {
    const stream = createReadStream(from);
    const extract = Extract({ path: to });

    extract.on('error', reject);
    extract.once('close', resolve);
    stream.pipe(extract);
  });

(async () => {
  await mkdir(baseDirectory, {
    recursive: true,
  }).catch((error: NodeJS.ErrnoException) => {
    if (error?.code !== 'EEXIST') {
      throw error;
    }
  });

  for (const target of targets) {
    const source = getUrl(target);
    const archive = getArchivePath(target);

    console.log(source);

    await download(source, archive);
    await unzip(archive, baseDirectory);
    await unlink(archive);
  }
})().catch(console.error);
