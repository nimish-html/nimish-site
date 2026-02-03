export const siteMetadata = {
  title: 'Nimish Gahlot',
  description:
    'Marketer who taught himself to code. Building AI agents, sharing experiments, and writing about growth, startups, and life.',
  siteUrl: 'https://nimishbuilds.xyz',
  author: 'Nimish Gahlot',
  locale: 'en_US',
  twitterHandle: '@anthropiast',
  ogImage: '/og.png',
};

export const ensureLeadingSlash = (path: string) =>
  path.startsWith('/') ? path : `/${path}`;

export const resolveUrl = (path?: string) => {
  if (!path) {
    return siteMetadata.siteUrl;
  }

  return `${siteMetadata.siteUrl}${ensureLeadingSlash(path)}`;
};
