import { parse as parseUrl } from 'url';
import { parse as parseQuery } from 'querystring';

import { ChromiumLauncher } from './chromium/launcher';

type CDPWindow = { windowId: string };

export type Token = string;

export class Authorizer {
  constructor(private chromiumLauncher: ChromiumLauncher) {}

  async authorize(): Promise<Token> {
    const page = await this.chromiumLauncher.launch(
      'https://teams.microsoft.com/_#/apps/66aeee93-507d-479a-a3ef-8f494af43945/sections/classroom'
    );

    const session = await page.target().createCDPSession();
    const meta = await session.send('Browser.getWindowForTarget');

    page.on('load', () => {
      const { host } = parseUrl(page.url());

      session.send('Browser.setWindowBounds', {
        windowId: (meta as CDPWindow).windowId,
        bounds: {
          windowState:
            host === 'login.microsoftonline.com' ? 'normal' : 'minimized',
        },
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    page.on('request', (_request) => {
      // console.debug('>', request.method(), request.url());
    });

    return new Promise<Token>((resolve, reject) => {
      page.on('response', (response) => {
        // console.debug('<', response.status(), response.statusText());

        if (response.status() === 302) {
          const location = response.headers()['location'];
          const hash = parseQuery(location.split('#')[1]);
          const state = (hash['state'] as string).split('|');

          if (state[1] === 'https://onenote.com/') {
            page.close();

            const token = hash['access_token'] as Token;
            if (token) {
              return resolve(hash['access_token'] as Token);
            }

            return reject('Failed to get the access token.');
          }
        }
      });
    });
  }
}
