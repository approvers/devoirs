import { join } from "path";
import { platform } from "os";

export type ChromiumContext = {
  directory: string;
  executable: string;
};

export function createChromiumContext(chromiumDirectory: string) {
  const getDirectory = name => join(chromiumDirectory, name);
  const target = platform();

  if (target === 'win32') {
    return {
      directory: getDirectory('chrome-win'),
      executable: 'chrome.exe',
    };
  }

  if (target === 'darwin') {
    return {
      directory: getDirectory('chrome-mac'),
      executable: 'Chromium.app/Contents/MacOS/Chromium',
    };
  }

  if (target === 'linux') {
    return {
      directory: getDirectory('chrome-linux'),
      executable: 'chrome',
    };
  }

  throw new Error('Unsupported platform: ' + target);
}
