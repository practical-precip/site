export const publishedSiteUrl = 'https://cameronbracken.github.io/pcwf_workshop_site_mockup';
export function assetPath(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`;
}
