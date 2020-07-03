import {
  createReadStream,
  createWriteStream,
  readdir,
  Dirent,
  PathLike,
  promises,
  constants,
} from 'fs';
import { tmpdir, platform } from 'os';
import { join } from 'path';

import { ChromiumContext } from './context';

const { chmod, mkdir } = promises;
const {
  S_IRUSR,
  S_IWUSR,
  S_IXUSR,
  S_IRGRP,
  S_IXGRP,
  S_IROTH,
  S_IXOTH,
} = constants;

export class ChromiumResolver {
  constructor(private context: ChromiumContext) {}

  async resolve(): Promise<string> {
    const context = this.context;
    const chromiumDirectory = context.directory;
    const temporaryDirectory = join(tmpdir(), '.devoirs', 'chromium');

    await this.createDirectory(temporaryDirectory);
    await this.copyDirectory(chromiumDirectory, temporaryDirectory);

    const executable = join(temporaryDirectory, context.executable);

    if (platform() !== 'win32') {
      // Change mode to `rwx r-x r-x`
      await chmod(
        executable,
        S_IRUSR | S_IWUSR | S_IXUSR | S_IRGRP | S_IXGRP | S_IROTH | S_IXOTH // 755
      );
    }

    return executable;
  }

  // noinspection JSMethodCanBeStatic
  private async createDirectory(path: string): Promise<void> {
    try {
      await mkdir(path, { recursive: true });
    } catch (error) {
      if (error?.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  private async copyDirectory(from: string, to: string): Promise<void> {
    for (const entry of await this.readDirectory(from)) {
      const source = join(from, entry.name);
      const destination = join(to, entry.name);

      if (entry.isDirectory()) {
        await this.createDirectory(destination);
        await this.copyDirectory(source, destination);
      } else if (entry.isFile()) {
        await this.copyFile(source, destination);
      }
    }
  }

  private copyFile(source: PathLike, destination: PathLike): Promise<void> {
    return new Promise<void>((resolve) => {
      const input = createReadStream(source);
      const output = createWriteStream(destination);

      output.once('close', resolve);
      input.pipe(output);
    });
  }

  private readDirectory(path: PathLike): Promise<Dirent[]> {
    return new Promise<Dirent[]>((resolve, reject) => {
      readdir(
        path,
        { withFileTypes: true },
        (error: Error | null, dirents: Dirent[]) => {
          if (error) {
            return reject(error);
          }

          resolve(dirents);
        }
      );
    });
  }
}
