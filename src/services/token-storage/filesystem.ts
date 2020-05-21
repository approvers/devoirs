import { join } from 'path';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';

import { ITokenStorage } from './index';

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

  load(): Promise<string> {
    return existsSync(this.path) ? null : readFile(this.path, {
      encoding: this.encoding,
    });
  }

}
