export interface ITokenProvider {
  get: () => Promise<string>;
  refresh: () => Promise<string>;
}
