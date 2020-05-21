export interface ITokenStorage {
  save(token: string): Promise<void>;
  load(): Promise<string>;
}
