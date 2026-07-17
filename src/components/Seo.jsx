import { Helmet } from 'react-helmet-async';

// Reusable per-page SEO. Drop <Seo title=… description=… /> into any page and it
// sets the document title, meta description, canonical URL, and Open Graph /
// Twitter tags so pages rank distinctly and share with a proper preview.

const SITE_NAME = 'Terra Estates';
const DEFAULT_TITLE = 'Terra Estates — Luxury Real Estate';
const DEFAULT_DESCRIPTION =
  'Discover an exclusive collection of the world’s most prestigious properties. Terra Estates curates luxury homes, villas and penthouses across the globe.';
const DEFAULT_IMAGE =
  'https://raw.githubusercontent.com/farazc60/Project-Images/refs/heads/main/Elysian%20Real%20Estate%20Template/7.png';

export default function Seo({ title, description, image, type = 'website', noindex = false }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = (description || DEFAULT_DESCRIPTION).replace(/\s+/g, ' ').trim().slice(0, 160);
  const img = image || DEFAULT_IMAGE;
  const url = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph (Facebook, WhatsApp, LinkedIn, …) */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      {url && <meta property="og:url" content={url} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
}
