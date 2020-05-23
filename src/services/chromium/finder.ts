import { join } from "path";
import { platform } from "os";
import { stat, Stats } from 'fs';

export class ChromiumFinder {

  constructor(
    private baseDirectory: string,
  ) {
  }

  async find(): Promise<ChromiumContext> {
    const chromiumDirectory = await this.getChromiumDirectory();
    const getDirectory = name => join(chromiumDirectory, name);
    const target = platform();

    if (target === 'win32') {
      return {
        directory: getDirectory('chrome-win'),
        executable: 'chrome.exe',
      };
    }

    if (target === 'darwin') {
      return {
        directory: getDirectory('chrome-mac'),
        executable: 'Chromium.app/Contents/MacOS/Chromium',
      };
    }

    if (target === 'linux') {
      return {
        directory: getDirectory('chrome-linux'),
        executable: 'chrome',
      };
    }

    throw new Error('Unsupported platform: ' + target);
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
