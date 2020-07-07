import { tmpdir } from 'os';
import { join } from 'path';

import { copyDirectory, createDirectory } from '../../utils/fs';
import { ResourceFinder } from './finder';

export class ResourceResolver {
  constructor(private finder: ResourceFinder) {}

  async resolve(...path: string[]): Promise<string> {
    const resourceDirectory = await this.finder.find(...path);
    const temporaryDirectory = join(tmpdir(), '.devoirs', ...path);

    await createDirectory(temporaryDirectory);
    await copyDirectory(resourceDirectory, temporaryDirectory);

    return temporaryDirectory;
  }
}
