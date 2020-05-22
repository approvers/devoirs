import { Token } from '../authorizer';

export interface ITokenStorage {
  save(token: Token): Promise<void>;
  load(): Promise<Token>;
  exists(): Promise<boolean>;
}
