import { ApiClient } from './services/api/client';
import { ApiProxy } from './services/api/proxy';
import { SavedTokenProvider } from './services/token/provider/saved';
import { FilesystemTokenStorage } from './services/token/storage/filesystem';
import { Authorizer } from './services/authorizer';
import { ChromiumResolver } from './services/chromium/resolver';
import { ChromiumLauncher } from './services/chromium/launcher';
import { GuiClient } from './services/gui/client';
import { ResourceFinder } from './services/resource/finder';
import { ResourceResolver } from './services/resource/resolver';
import { Appdata } from './services/appdata';

const baseUrl = 'https://assignments.onenote.com/api/v1.0';

(async () => {
  const appdata = new Appdata();
  const resourceFinder = new ResourceFinder(__dirname);
  const resourceResolver = new ResourceResolver(resourceFinder);
  const resolver = new ChromiumResolver(resourceResolver);
  const launcher = new ChromiumLauncher(resolver);
  const authorizer = new Authorizer(launcher);
  const tokenStorage = new FilesystemTokenStorage(appdata);
  const tokenProvider = new SavedTokenProvider(tokenStorage, authorizer);
  const proxy = new ApiProxy(baseUrl, tokenProvider);
  const client = new ApiClient(proxy);
  const gui = new GuiClient(client, launcher, resourceResolver);

  await gui.start();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
