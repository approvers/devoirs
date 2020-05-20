import { join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
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

  save(token: string): void {
    writeFileSync(this.path, token, {
      encoding: this.encoding,
    });
  }

  load(): string {
    return !existsSync(this.path) ? null : readFileSync(this.path, {
      encoding: this.encoding,
    });
  }

}
