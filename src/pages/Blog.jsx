import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Eye, ArrowRight, Bed, Bath, Ruler } from 'lucide-react';
import { getProperties, getViewCounts } from '../utils/storage';
import Seo from '../components/Seo';

// The Blog writes itself from the catalogue: it ranks properties by how many
// times their detail page has been viewed (see storage.getViewCounts) and turns
// the top ones into editorial "spotlight" articles. No manual authoring, and no
// backend required — swap getViewCounts to Supabase later for a global ranking.

// A handful of headline + intro templates keyed off property type so the copy
// reads like a magazine instead of a data dump. Chosen deterministically by id
// so a given property always gets the same article.
const TEMPLATES = [
  {
    category: 'Property Spotlight',
    title: (p) => `Inside the ${p.title}: ${p.city}'s Most Coveted ${p.type}`,
    intro: (p) =>
      `Few addresses capture the spirit of ${p.city} quite like this ${p.type.toLowerCase()}. We step inside one of ${p.country}'s most requested listings to see what keeps buyers coming back.`,
  },
  {
    category: 'Market Insight',
    title: (p) => `Why ${p.city} Buyers Can't Stop Viewing This ${p.type}`,
    intro: (p) =>
      `Demand tells a story. This ${p.type.toLowerCase()} in ${p.city} has quietly become one of our most-viewed homes — here's the appeal behind the numbers.`,
  },
  {
    category: 'Design & Living',
    title: (p) => `A Closer Look: Living the ${p.city} Dream at the ${p.title}`,
    intro: (p) =>
      `From its ${(p.features && p.features[0]) ? p.features[0].toLowerCase() : 'signature spaces'} to its skyline setting, this ${p.type.toLowerCase()} is a masterclass in modern luxury living in ${p.country}.`,
  },
];

const pickTemplate = (p) => TEMPLATES[Number(p.id) % TEMPLATES.length];

// Rough read time from the description length — purely cosmetic.
const readTime = (p) => Math.max(2, Math.round((p.description || '').split(' ').length / 60)) + ' min read';

function buildArticles(properties, views) {
  return [...properties]
    .map((p) => ({ ...p, views: views[p.id] || 0 }))
    // Most-viewed first; ties fall back to id so the order is stable.
    .sort((a, b) => b.views - a.views || a.id - b.id);
}

function ViewBadge({ count }) {
  if (!count) return <span className="text-xs uppercase tracking-wider text-soft-gold">Editor's Pick</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
      <Eye className="w-3.5 h-3.5 text-soft-gold" />
      {count.toLocaleString()} {count === 1 ? 'view' : 'views'}
    </span>
  );
}

function FeaturedArticle({ p }) {
  const t = pickTemplate(p);
  return (
    <Link
      to={`/properties/${p.id}`}
      className="group grid md:grid-cols-2 gap-8 md:gap-12 items-center rounded-2xl overflow-hidden"
    >
      <div className="overflow-hidden rounded-2xl">
        <img
          src={p.img}
          alt={p.title}
          loading="lazy"
          decoding="async"
          className="w-full h-72 md:h-[26rem] object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-xs uppercase tracking-[0.3em] text-soft-gold">{t.category}</span>
          <ViewBadge count={p.views} />
        </div>
        <h3 className="font-display text-3xl md:text-4xl leading-tight group-hover:text-soft-gold transition-colors">
          {t.title(p)}
        </h3>
        <p className="mt-4 text-gray-600 leading-relaxed">{t.intro(p)}</p>
        <div className="flex items-center gap-5 mt-6 text-sm text-gray-500">
          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-soft-gold" />{p.city}, {p.country}</span>
          <span>{readTime(p)}</span>
        </div>
        <span className="inline-flex items-center gap-2 mt-6 text-charcoal font-medium group-hover:gap-3 transition-all">
          Read the story <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}

function ArticleCard({ p }) {
  const t = pickTemplate(p);
  return (
    <Link
      to={`/properties/${p.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 hover:border-soft-gold/40 hover:shadow-xl transition-all duration-300 bg-white"
    >
      <div className="overflow-hidden">
        <img
          src={p.img}
          alt={p.title}
          loading="lazy"
          decoding="async"
          className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-[0.25em] text-soft-gold">{t.category}</span>
          <ViewBadge count={p.views} />
        </div>
        <h4 className="font-display text-xl leading-snug group-hover:text-soft-gold transition-colors">
          {t.title(p)}
        </h4>
        <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-3">{t.intro(p)}</p>
        <div className="flex items-center gap-4 mt-5 pt-5 border-t border-gray-100 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{p.beds}</span>
          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{p.baths}</span>
          <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" />{p.size}</span>
          <span className="ml-auto text-soft-gold font-semibold">{p.price}</span>
        </div>
      </div>
    </Link>
  );
}

export default function Blog() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProperties().then((list) => {
      setArticles(buildArticles(list, getViewCounts()));
      setLoading(false);
    });
  }, []);

  const [featured, ...rest] = articles;

  return (
    <>
      <Seo
        title="Journal"
        description="Terra Estates Journal — property spotlights and market insight, led by the homes our clients are viewing most right now."
      />

      {/* Hero */}
      <section className="pt-28 pb-4 text-center px-6">
        <p className="uppercase tracking-[0.4em] text-soft-gold text-sm mb-4">The Terra Journal</p>
        <h2 className="font-display text-5xl md:text-6xl">Stories From the Collection.</h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Curated spotlights on the properties our clients are exploring most — refreshed automatically as interest shifts.
        </p>
      </section>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-charcoal rounded-full animate-spin" />
        </div>
      ) : articles.length === 0 ? (
        <p className="text-center text-gray-500 py-24">No stories yet — check back soon.</p>
      ) : (
        <>
          {/* Featured */}
          <section className="max-w-6xl mx-auto px-6 py-14">
            <FeaturedArticle p={featured} />
          </section>

          {/* Grid */}
          {rest.length > 0 && (
            <section className="max-w-6xl mx-auto px-6 pb-24">
              <h3 className="font-display text-2xl mb-8 flex items-center gap-3">
                More Stories
                <span className="h-px flex-1 bg-gray-200" />
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {rest.map((p) => <ArticleCard key={p.id} p={p} />)}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
