import { join } from "path";
import { stat, Stats } from 'fs';

import { ChromiumContext, createChromiumContext } from './context';

export class ChromiumFinder {

  constructor(
    private baseDirectory: string,
  ) {
  }

  async find(): Promise<ChromiumContext> {
    return createChromiumContext(
      await this.getChromiumDirectory(),
    );
  }

  private async getChromiumDirectory(): Promise<string> {
    const defaultDirectory = join(this.baseDirectory, 'chromium');
    const fallbackDirectory = join(this.baseDirectory, '..', 'chromium');

    return this.tryDirectory(defaultDirectory)
      .catch(() => this.tryDirectory(fallbackDirectory))
      .catch(() => {
        throw new Error(
          'Failed to resolve Chromium. Have you downloaded it?',
        );
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
