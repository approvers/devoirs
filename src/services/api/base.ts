import { request } from "https";

import { ITokenProvider } from '../token/provider';
import { asyncOrSync } from '../../utilities/async-or-sync';

export class ApiClientBase {

  constructor(
    private baseUrl: string,
    private tokenProvider: ITokenProvider,
  ) {
  }

  protected request<T>(method: string, path: string, refreshToken: boolean = false): Promise<T> {
    return new Promise<T>(((resolve, reject) => {
      (async () => {
        const url = this.baseUrl + path;
        const token = await ((
          refreshToken
            ? asyncOrSync(this.tokenProvider.refreshAsync, this.tokenProvider.refresh, this.tokenProvider)
            : asyncOrSync(this.tokenProvider.getAsync, this.tokenProvider.get, this.tokenProvider)
        )());

        const options = {
          method,
          headers: {
            'authorization': `Bearer ${token}`,
          },
        };

        const callback = response => {
          let data = '';

          if (response.statusCode === 401) {
            return this.request(method, path, true);
          } else if (response.statusCode !== 200) {
            reject(response);
            return;
          }

          response.on('data', chunk => data += chunk);
          response.on('end', () => {
            resolve(JSON.parse(data)['value'] as T);
          });
        };

        request(url, options, callback)
          .on('error', error => {
            reject(error);
          })
          .end();
      })();
    }));
  }

}
