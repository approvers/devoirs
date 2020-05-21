import { ITokenProvider } from '.';
import { ITokenStorage } from '../../token-storage';
import { Authorizer } from '../../authorizer';

export class SavedTokenProvider implements ITokenProvider {

  constructor(
    private storage: ITokenStorage,
    private authorizer: Authorizer,
  ) {
  }

  async get(): Promise<string> {
    return this.storage.load();
  }

  async refresh(): Promise<string> {
    const token = await this.authorizer.authorize();
    await this.storage.save(token);

    return token;
  }

}
