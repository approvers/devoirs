export function asyncOrSync<T, K extends any[]>(
  fAsync?: (...args: K) => Promise<T>,
  fSync?: (...args: K) => T,
  thisArg?: any,
): (...args: K) => Promise<T> {
  return fAsync?.bind(thisArg) || ((...args: K) => new Promise<T>((resolve, reject) => {
    try {
      resolve(fSync?.call(thisArg, ...args));
    } catch (error) {
      reject(error);
    }
  }));
}
