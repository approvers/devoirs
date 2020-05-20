import { ITokenProvider } from '.';
import { ITokenStorage } from '../../token-storage';
import { Authorizer } from '../../authorizer';

export class SavedTokenProvider implements ITokenProvider {

  constructor(
    private storage: ITokenStorage,
    private authorizer: Authorizer,
  ) {
  }

  get(): string {
    return this.storage.load();
  }

  async refreshAsync(): Promise<string> {
    const token = await this.authorizer.authorize();
    this.storage.save(token);

    return token;
  }

}
