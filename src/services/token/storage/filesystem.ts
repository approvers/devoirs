import { join } from 'path';
import { format } from 'util';
import { promises } from 'fs';

import { ITokenStorage } from './index';
import { Token } from '../../authorizer';
import { Appdata } from '../../appdata';

const { readFile, stat, writeFile } = promises;

const defaults = {
  filename: 'token.dat',
  encoding: 'utf8' as BufferEncoding,
};

export class FilesystemTokenStorage implements ITokenStorage {
  constructor(
    private appdata: Appdata,
    private filename: string = defaults.filename,
    private encoding: BufferEncoding = defaults.encoding
  ) {}

  async save(token: Token): Promise<void> {
    const path = await this.getPath();

    return await writeFile(path, token, {
      encoding: this.encoding,
    });
  }

  async load(): Promise<Token> {
    const path = await this.getPath();

    if (!(await this.exists())) {
      throw new Error(format('File not exists or not a file: %s', path));
    }

    return await readFile(path, {
      encoding: this.encoding,
    });
  }

  async exists(): Promise<boolean> {
    const path = await this.getPath();

    try {
      return (await stat(path)).isFile();
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }

      throw error;
    }
  }

  private async getPath(): Promise<string> {
    return join(await this.appdata.get(), this.filename);
  }
}
