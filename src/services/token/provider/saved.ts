import { ITokenProvider } from '.';
import { ITokenStorage } from '../../token-storage';
import { Authorizer, Token } from '../../authorizer';

export class SavedTokenProvider implements ITokenProvider {

  constructor(
    private storage: ITokenStorage,
    private authorizer: Authorizer,
  ) {
  }

  async get(): Promise<Token> {
    return this.storage.load();
  }

  async refresh(): Promise<Token> {
    const token = await this.authorizer.authorize();
    await this.storage.save(token);

    return token;
  }

}
