import { join } from 'path';
import { stat, Stats } from 'fs';

export class ResourceFinder {
  constructor(private baseDirectory: string) {}

  async find(...path: string[]): Promise<string> {
    const defaultDirectory = join(this.baseDirectory, ...path);
    const fallbackDirectory = join(this.baseDirectory, '..', ...path);

    return this.tryDirectory(defaultDirectory)
      .catch(() => this.tryDirectory(fallbackDirectory))
      .catch(() => {
        throw new Error(`Failed to resolve directory: ${path.join('/')}`);
      });
  }

  private async tryDirectory(path: string): Promise<string> {
    if (!(await this.isDirectoryExists(path))) {
      throw new Error(`Directory not found: ${path}`);
    }

    return path;
  }

  // noinspection JSMethodCanBeStatic
  private isDirectoryExists(path: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      stat(path, (error: NodeJS.ErrnoException, stats: Stats) => {
        if (error) {
          if (error.code !== 'ENOENT') {
            return reject(error);
          }

          return resolve(false);
        }

        resolve(stats.isDirectory());
      });
    });
  }
}
