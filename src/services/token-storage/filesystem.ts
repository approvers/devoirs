import { join } from 'path';
import { format } from 'util';
import { promises } from 'fs';

import { ITokenStorage } from './index';

const { readFile, stat, writeFile } = promises;

const defaults = {
  filename: 'token.dat',
  encoding: 'utf8' as BufferEncoding,
}

export class FilesystemTokenStorage implements ITokenStorage {

  private readonly path: string;

  constructor(
    directory: string,
    filename: string = defaults.filename,
    private encoding: BufferEncoding = defaults.encoding,
  ) {
    this.path = join(directory, filename);
  }

  save(token: string): Promise<void> {
    return writeFile(this.path, token, {
        encoding: this.encoding,
    });
  }

  async load(): Promise<string> {
    if (!(await this.exists())) {
      throw new Error(
        format(
          'File not exists or not a file: %d',
          this.path,
        ),
      );
    }

    return await readFile(this.path, {
      encoding: this.encoding,
    });
  }

  async exists(): Promise<boolean> {
    return (await stat(this.path)).isFile();
  }

}
