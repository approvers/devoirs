import { Token } from '../../authorizer';

export interface ITokenProvider {
  get: () => Promise<Token>;
  refresh: () => Promise<Token>;
}
