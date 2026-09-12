export const publishedSiteUrl = 'https://practical-precip.github.io/site';
export function assetPath(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`;
}
