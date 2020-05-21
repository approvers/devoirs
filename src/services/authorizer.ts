import { parse as parseQuery } from 'querystring';
import { launch } from 'puppeteer';

export class Authorizer {
  async authorize(): Promise<string> {
    const browser = await launch({
      headless: false,
      args: [
        '--window-size=800,600',
        '--app=https://teams.microsoft.com/_#/apps/66aeee93-507d-479a-a3ef-8f494af43945/sections/classroom'
      ]
    });

    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

    page.on('request', request => {
      console.debug('>', request.method(), request.url());
    });

    return new Promise(resolve => {
      page.on('response', response => {
        console.debug('<', response.status(), response.statusText());

        if (response.status() === 302) {
          const location = response.headers()['location'];
          const hash = parseQuery(location.split('#')[1]);
          const state = (hash['state'] as string).split('|');

          if (state[1] === 'https://onenote.com/') {
            resolve(hash['access_token'] as string);
            browser.close();
          }
        }
      });
    });
  }
}
