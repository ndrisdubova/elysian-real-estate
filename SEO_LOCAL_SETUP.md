# Tier 3 SEO — Local search setup

The code adds structured data (JSON-LD) so Google understands your business and
listings. To get the full local-SEO benefit, also do these free, one-time steps.

## 1. Edit your real business details (REQUIRED)
The structured data currently uses placeholder values. Update them to your real
info, then re-deploy:

- **`index.html`** → the `RealEstateAgent` JSON-LD block:
  - `address` (streetAddress, addressLocality, postalCode, addressCountry — `XK` = Kosovo)
  - `telephone`, `email`, `areaServed`
  - Replace `https://www.terraestates.com` with your real domain (also in
    `public/robots.txt` and `public/sitemap.xml`).

## 2. Google Business Profile (biggest local win — free)
This is what puts you on **Google Maps** and the local "3-pack".
1. Go to https://business.google.com → **Manage now**.
2. Add "Terra Estates", category **Real estate agency**.
3. Add your address, phone (+383 48 77 33 88), hours, photos, website URL.
4. Verify (postcard / phone / email).

## 3. Google Search Console (free — see how you rank)
1. https://search.google.com/search-console → add your domain.
2. Verify ownership (DNS record or HTML file).
3. **Sitemaps** → submit `sitemap.xml`.
4. Use **URL Inspection** to see how Google crawls each page.

## 4. Test the structured data
- Paste a live page URL into https://search.google.com/test/rich-results
- The homepage should detect **RealEstateAgent** + **WebSite**.
- A listing page should detect the **Residence/Apartment/House** + **BreadcrumbList**.

## Note on Albanian (future)
If you add an Albanian version later, add `hreflang` tags so Google serves the
right language to Kosovo vs. international visitors. Ask and I'll wire it up.
