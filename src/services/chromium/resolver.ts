import { constants } from 'fs';
import { platform } from 'os';
import { join } from 'path';

import { createChromiumContext } from './context';
import { chmodDirectory } from '../../utils/fs';
import { ResourceResolver } from '../resource/resolver';

const {
  S_IRUSR,
  S_IWUSR,
  S_IXUSR,
  S_IRGRP,
  S_IXGRP,
  S_IROTH,
  S_IXOTH,
} = constants;

export class ChromiumResolver {
  constructor(private resolver: ResourceResolver) {}

  async resolve(): Promise<string> {
    const context = createChromiumContext();
    const chromiumDirectory = context.directory;
    const temporaryDirectory = await this.resolver.resolve(chromiumDirectory);
    const executable = join(temporaryDirectory, context.executable);

    // Change mode to `rwx r-x r-x`
    const target = platform();
    const mode =
      S_IRUSR | S_IWUSR | S_IXUSR | S_IRGRP | S_IXGRP | S_IROTH | S_IXOTH; // 755

    if (target !== 'win32') {
      await chmodDirectory(temporaryDirectory, mode);
    }

    return executable;
  }
}
