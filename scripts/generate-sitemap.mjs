// Generates dist/sitemap.xml at build time: the static marketing pages plus one
// entry per property listing (/properties/:id) pulled from Supabase, so Google
// can discover and index every listing. Runs after `vite build` (see package.json).
//
// Resilient by design: if the DB is unreachable or env vars are missing, it logs
// a warning and exits 0, leaving the static public/sitemap.xml that vite already
// copied into dist/ — so a transient DB hiccup never fails the deploy.
import { writeFileSync } from 'node:fs';
import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://terra-realestate.vercel.app';

// Env comes from process.env on Vercel, or .env* files locally (via Vite's loader).
const fileEnv = loadEnv('production', process.cwd(), 'VITE_');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL;
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY || fileEnv.VITE_SUPABASE_ANON_KEY;

const STATIC_PAGES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/properties', changefreq: 'daily', priority: '0.9' },
  { path: '/agents', changefreq: 'monthly', priority: '0.7' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
];

function urlEntry({ loc, changefreq, priority, lastmod }) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n');
}

async function main() {
  let listings = [];
  if (SUPABASE_URL && SUPABASE_ANON) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
    const { data, error } = await supabase.from('properties').select('id, created_at').order('id');
    if (error) throw error;
    listings = data || [];
  } else {
    console.warn('[sitemap] Supabase env vars missing — writing static pages only.');
  }

  const entries = [
    ...STATIC_PAGES.map((p) => ({ loc: SITE_URL + p.path, changefreq: p.changefreq, priority: p.priority })),
    ...listings.map((p) => ({
      loc: `${SITE_URL}/properties/${p.id}`,
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: p.created_at ? new Date(p.created_at).toISOString().slice(0, 10) : undefined,
    })),
  ];

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries.map(urlEntry).join('\n') +
    '\n</urlset>\n';

  writeFileSync('dist/sitemap.xml', xml);
  console.log(`[sitemap] wrote dist/sitemap.xml — ${entries.length} URLs (${listings.length} listings).`);
}

main().catch((err) => {
  console.warn('[sitemap] generation failed, keeping static fallback:', err.message);
  process.exit(0); // never fail the build over the sitemap
});
