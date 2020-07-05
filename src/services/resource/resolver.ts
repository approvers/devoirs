import {
  createReadStream,
  createWriteStream,
  readdir,
  Dirent,
  PathLike,
  promises,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { ResourceFinder } from './finder';

const { mkdir } = promises;

export class ResourceResolver {
  constructor(private finder: ResourceFinder) {}

  async resolve(...path: string[]): Promise<string> {
    const resourceDirectory = await this.finder.find(...path);
    const temporaryDirectory = join(tmpdir(), '.devoirs', ...path);

    await this.createDirectory(temporaryDirectory);
    await this.copyDirectory(resourceDirectory, temporaryDirectory);

    return temporaryDirectory;
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
