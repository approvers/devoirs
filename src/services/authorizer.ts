import { parse as parseQuery } from 'querystring';
import { launch } from 'puppeteer-core';

import { ChromiumResolver } from './chromium/resolver';

export type Token = string;

export class Authorizer {
  constructor(private chromiumResolver: ChromiumResolver) {}

  async authorize(): Promise<Token> {
    const browser = await launch({
      executablePath: await this.chromiumResolver.resolve(),
      headless: false,
      args: [
        '--no-sandbox',
        '--window-size=800,600',
        '--app=https://teams.microsoft.com/_#/apps/66aeee93-507d-479a-a3ef-8f494af43945/sections/classroom',
      ],
    });

    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

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
            browser.close();

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
