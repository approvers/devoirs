export interface ITokenProvider {
  get?: () => string;
  refresh?: () => string;
  getAsync?: () => Promise<string>;
  refreshAsync?: () => Promise<string>;
}
