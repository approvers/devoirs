export type Target = {
  prefix: string;
  name: string;
  pkg: string;
  output: string;
};

export const targets: Target[] = [
  {
    prefix: 'Win_x64',
    name: 'chrome-win',
    pkg: 'latest-win-x64',
    output: 'devoirs-win-x64.exe',
  },
  {
    prefix: 'Mac',
    name: 'chrome-mac',
    pkg: 'latest-macos-x64',
    output: 'devoirs-macos-x64',
  },
  {
    prefix: 'Linux_x64',
    name: 'chrome-linux',
    pkg: 'latest-linux-x64',
    output: 'devoirs-linux-x64',
  },
];
