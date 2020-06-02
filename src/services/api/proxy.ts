import { IncomingMessage } from 'http';
import { request, RequestOptions } from 'https';

import { ITokenProvider } from '../token/provider';

export type Method =
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'TRACE'
  | 'PATCH';

export class ApiProxy {
  constructor(private baseUrl: string, private tokenProvider: ITokenProvider) {}

  public async request<T>(
    method: Method,
    path: string,
    refreshToken = false
  ): Promise<T> {
    const url = this.baseUrl + path;
    const token = await (refreshToken
      ? this.tokenProvider.refresh()
      : this.tokenProvider.get());

    const options: RequestOptions = {
      method,
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    return new Promise<T>((resolve, reject) => {
      const callback = (response: IncomingMessage) => {
        let data = '';

        if (response.statusCode === 401) {
          return resolve(this.request(method, path, true));
        }

        if (response.statusCode !== 200) {
          return reject(response);
        }

        response.on('data', (chunk) => (data += chunk));
        response.on('end', () => {
          try {
            resolve(JSON.parse(data)['value'] as T);
          } catch (error) {
            reject(error);
          }
        });
      };

      request(url, options, callback).on('error', reject).end();
    });
  }
}
