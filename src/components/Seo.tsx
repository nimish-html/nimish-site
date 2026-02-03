import { Helmet } from 'react-helmet-async';
import { resolveUrl, siteMetadata } from '../data/siteMetadata';

export type SeoProps = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | null;
};

export function Seo({
  title,
  description,
  path,
  image,
  type = 'website',
  noindex = false,
  jsonLd,
}: SeoProps) {
  const metaTitle = title
    ? title === siteMetadata.title
      ? title
      : `${title} | ${siteMetadata.title}`
    : siteMetadata.title;
  const metaDescription = description || siteMetadata.description;
  const canonicalUrl = resolveUrl(path);
  const imageUrl = image
    ? image.startsWith('http')
      ? image
      : resolveUrl(image)
    : resolveUrl(siteMetadata.ogImage);
  const twitterHandle = siteMetadata.twitterHandle;

  return (
    <Helmet htmlAttributes={{ lang: 'en' }}>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="author" content={siteMetadata.author} />

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteMetadata.title} />
      <meta property="og:locale" content={siteMetadata.locale} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={metaTitle} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={imageUrl} />
      {twitterHandle ? <meta name="twitter:site" content={twitterHandle} /> : null}
      {twitterHandle ? <meta name="twitter:creator" content={twitterHandle} /> : null}

      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}

      {jsonLd ? (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      ) : null}
    </Helmet>
  );
}
