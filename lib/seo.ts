export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arranvanaerschot.dev';
export const SITE_NAME = 'root@arranvanaerschot';
export const AUTHOR = 'Arran VanAerschot';
export const TWITTER_HANDLE = '@arranvanaerschot';
export const DEFAULT_DESCRIPTION =
  'Arran VanAerschot — Junior Software Engineer & Automation Engineer based in Brussels.';

export function absUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
