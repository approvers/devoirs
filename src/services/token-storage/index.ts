export interface ITokenStorage {
  save(token: string): void;
  load(): string;
}
