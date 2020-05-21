import { request } from "https";

import { ITokenProvider } from '../token/provider';

export class ApiClientBase {

  constructor(
    private baseUrl: string,
    private tokenProvider: ITokenProvider,
  ) {
  }

  protected async request<T>(method: string, path: string, refreshToken: boolean = false): Promise<T> {
    const url = this.baseUrl + path;
    const token = await ((
      refreshToken ? this.tokenProvider.refresh : this.tokenProvider.get
    )());

    const options = {
      method,
      headers: {
        'authorization': `Bearer ${token}`,
      },
    };

    return new Promise<T>((resolve, reject) => {
      const callback = response => {
        let data = '';

        if (response.statusCode === 401) {
          return resolve(
            this.request(method, path, true)
          );
        }

        if (response.statusCode !== 200) {
          return reject(response);
        }

        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          resolve(JSON.parse(data)['value'] as T);
        });
      };

      request(url, options, callback)
        .on('error', reject)
        .end();
    });
  }

}
