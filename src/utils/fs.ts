import { join } from 'path';
import {
  createReadStream,
  createWriteStream,
  readdir,
  Dirent,
  PathLike,
  promises,
} from 'fs';

const { chmod, mkdir } = promises;

export async function createDirectory(path: string): Promise<void> {
  try {
    await mkdir(path, { recursive: true });
  } catch (error) {
    if (error?.code !== 'EEXIST') {
      throw error;
    }
  }
}

export async function copyDirectory(from: string, to: string): Promise<void> {
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

export function copyFile(source: PathLike, dest: PathLike): Promise<void> {
  return new Promise<void>((resolve) => {
    const input = createReadStream(source);
    const output = createWriteStream(dest);

    output.once('close', resolve);
    input.pipe(output);
  });
}

export function readDirectory(path: PathLike): Promise<Dirent[]> {
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

export async function chmodDirectory(
  path: string,
  mode: number
): Promise<void> {
  for (const entry of await this.readDirectory(path)) {
    const target = join(path, entry.name);

    if (entry.isDirectory()) {
      await chmodDirectory(target, mode);
    } else if (entry.isFile()) {
      await chmod(target, mode);
    }
  }
}
