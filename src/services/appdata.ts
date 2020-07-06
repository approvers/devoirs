import { platform } from 'os';
import { dirname, join } from 'path';
import { promises } from 'fs';

const { mkdir } = promises;

const getDirectory = () => {
  const target = platform();

  if (target === 'win32') {
    return process.env.APPDATA;
  }

  if (target === 'darwin') {
    return join(process.env.HOME, 'Library', 'Preferences');
  }

  if (target === 'linux') {
    return join(process.env.HOME, '.config');
  }

  throw new Error('Unsupported platform: ' + target);
};

export class Appdata {
  constructor(private path: string = join(getDirectory(), 'devoirs')) {}

  async get(): Promise<string> {
    await mkdir(dirname(this.path)).catch((e: NodeJS.ErrnoException) => {
      if (e.code === 'EEXIST') {
        return;
      }

      throw e;
    });

    return this.path;
  }
}
