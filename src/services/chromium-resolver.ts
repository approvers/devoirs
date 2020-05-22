import { createReadStream, createWriteStream, readdir, stat as statAsync, Dirent, PathLike, Stats, promises } from 'fs';
import { platform, tmpdir } from 'os';
import { join } from 'path';

const { chmod, mkdir } = promises;

type ChromiumContext = {
  directory: string;
  executable: string;
};

export class ChromiumResolver {

  constructor(
    private baseDirectory: string,
  ) {
  }

  async resolve(): Promise<string> {
    const context = await this.getChromiumContext();
    const chromiumDirectory = context.directory;
    const temporaryDirectory = join(tmpdir(), '.devoirs-chromium');

    await this.createDirectory(temporaryDirectory);
    await this.copyDirectory(chromiumDirectory, temporaryDirectory);

    const executable = join(temporaryDirectory, context.executable);
    await chmod(executable, 0o755);

    return executable;
  }

  // noinspection JSMethodCanBeStatic
  private async createDirectory(path: string): Promise<void> {
    try {
      await mkdir(path);
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
      readdir(path, { withFileTypes: true }, (error: Error | null, dirents: Dirent[]) => {
        if (error) {
          reject(error);
        } else {
          resolve(dirents);
        }
      });
    });
  }

  private async getChromiumContext(): Promise<ChromiumContext> {
    const chromiumDirectory = await this.getChromiumDirectory();
    const getDirectory = name => join(chromiumDirectory, name);
    const target = platform();

    if (target === 'win32') {
      return {
        directory: getDirectory('chrome-win'),
        executable: 'chrome.exe',
      }
    }

    if (target === 'darwin') {
      return {
        directory: getDirectory('chrome-mac'),
        executable: 'Chromium.app/Contents/MacOS/Chromium',
      }
    }

    if (target === 'linux') {
      return {
        directory: getDirectory('chrome-linux'),
        executable: 'chrome',
      }
    }

    throw new Error('Unsupported platform: ' + target);
  }

  private async getChromiumDirectory(): Promise<string> {
    const defaultDirectory = join(this.baseDirectory, 'chromium');
    if (await this.isDirectoryExists(defaultDirectory)) {
      return defaultDirectory;
    }

    const fallbackDirectory = join(this.baseDirectory, '..', 'chromium');
    if (await this.isDirectoryExists(fallbackDirectory)) {
      return fallbackDirectory;
    }

    throw new Error(
      'Failed to resolve Chromium. Have you downloaded it?',
    );
  }

  // noinspection JSMethodCanBeStatic
  private isDirectoryExists(path: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      statAsync(path, (error: NodeJS.ErrnoException, stats: Stats) => {
        if (error) {
          if (error?.code !== 'ENOENT') {
            return reject(error);
          }

          return resolve(false);
        }

        resolve(stats.isDirectory());
      });
    });
  }

}
