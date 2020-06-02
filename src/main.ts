import { ApiClient } from './services/api/client';
import { ApiProxy } from './services/api/proxy';
import { SavedTokenProvider } from './services/token/provider/saved';
import { FilesystemTokenStorage } from './services/token-storage/filesystem';
import { Authorizer } from './services/authorizer';
import { ChromiumResolver } from './services/chromium/resolver';
import { ChromiumFinder } from './services/chromium/finder';

const baseUrl = 'https://assignments.onenote.com/api/v1.0';

(async () => {
  const chromium = await new ChromiumFinder(__dirname).find();
  const resolver = new ChromiumResolver(chromium);
  const authorizer = new Authorizer(resolver);
  const tokenStorage = new FilesystemTokenStorage(process.cwd());
  const tokenProvider = new SavedTokenProvider(tokenStorage, authorizer);
  const proxy = new ApiProxy(baseUrl, tokenProvider);
  const client = new ApiClient(proxy);

  for (const c of await client.getClasses()) {
    console.log(`-`, c.name);

    for (const a of await client.getAssignments(c.id)) {
      console.log('\t', a['isCompleted'] ? '✔' : '❗', a.displayName);
    }
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
