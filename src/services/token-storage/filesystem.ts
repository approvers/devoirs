import { join } from 'path';
import { format } from 'util';
import { promises } from 'fs';

import { ITokenStorage } from './index';
import { Token } from '../authorizer';

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

  save(token: Token): Promise<void> {
    return writeFile(this.path, token, {
        encoding: this.encoding,
    });
  }

  async load(): Promise<Token> {
    if (!(await this.exists())) {
      throw new Error(
        format(
          'File not exists or not a file: %s',
          this.path,
        ),
      );
    }

    return await readFile(this.path, {
      encoding: this.encoding,
    });
  }

  async exists(): Promise<boolean> {
    try {
      return (await stat(this.path)).isFile();
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }

      throw error;
    }
  }

}
