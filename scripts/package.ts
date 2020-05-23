import { promises } from 'fs';
import { join } from 'path';
import { exec as pack } from 'pkg';

import { targets } from './targets';

const { mkdir, writeFile, unlink } = promises;

const baseDirectory = join(__dirname, '..');
const packages = join(baseDirectory, 'packages');

(async () => {
  await (
    mkdir(packages)
      .catch((error: NodeJS.ErrnoException) => {
        if (error?.code !== 'EEXIST') {
          throw error;
        }
      })
  );

  for (const target of targets) {
    const config = {
      pkg: {
        assets: `../chromium/${target.name}/**/*`,
      },
    };

    const path = join(baseDirectory, 'packages', `${target.pkg}.json`);
    await writeFile(path, JSON.stringify(config));

    await pack([
      'index.js',
      '--config',
      path,
      '--target',
      target.pkg,
      '--output',
      `./packages/${target.output}`,
    ]);

    await unlink(path);
  }
})()
  .catch(console.error);
