import { join } from 'path';
import { tmpdir } from 'os';
import { launch, Page, Browser } from 'puppeteer-core';
import { ChromiumResolver } from './resolver';

export class ChromiumLauncher {
  private browser: Browser;

  constructor(private chromiumResolver: ChromiumResolver) {}

  async launch(url: string, width = 800, height = 600): Promise<Page> {
    if (!this.browser) {
      this.browser = await launch({
        executablePath: await this.chromiumResolver.resolve(),
        headless: false,
        defaultViewport: null,
        userDataDir: join(tmpdir(), '.devoirs', 'data'),
        args: [
          '--no-sandbox',
          `--window-size=${width},${height}`,
          `--app=${url}`,
        ],
      });

      const pages = await this.browser.pages();

      if (pages.length > 0) {
        return pages[0];
      }
    }

    const page = await this.browser.newPage();
    await page.goto(url);

    return page;
  }
}
