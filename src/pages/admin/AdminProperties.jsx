import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Link2 } from 'lucide-react';
import { getProperties, addProperty, updateProperty, deleteProperty } from '../../utils/storage';

const TYPES = ['Apartment', 'Villa', 'Penthouse', 'House', 'Studio'];

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin',
  'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso',
  'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Chad', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia',
  'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Georgia', 'Germany', 'Ghana', 'Greece',
  'Guatemala', 'Guinea', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq',
  'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kosovo', 'Kuwait',
  'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mauritius', 'Mexico', 'Moldova', 'Monaco',
  'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nepal', 'Netherlands',
  'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Panama',
  'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Singapore', 'Slovakia', 'Slovenia', 'Somalia',
  'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
  'Tajikistan', 'Tanzania', 'Thailand', 'Tunisia', 'Turkey', 'Turkmenistan', 'UAE', 'Uganda', 'UK', 'Ukraine',
  'Uruguay', 'USA', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
];

const EMPTY_FORM = {
  title: '', type: 'Apartment', city: '', country: '', price: '',
  beds: '', baths: '', size: '', img: '', description: '', features: '',
};

function PhotoInput({ label, value, onChange, required }) {
  const [mode, setMode] = useState('url');
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition
            ${mode === 'url' ? 'bg-[var(--admin-accent)] text-black border-[var(--admin-accent)]' : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20'}`}
        >
          <Link2 className="w-3.5 h-3.5" /> URL
        </button>
        <button
          type="button"
          onClick={() => setMode('file')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition
            ${mode === 'file' ? 'bg-[var(--admin-accent)] text-black border-[var(--admin-accent)]' : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20'}`}
        >
          <Upload className="w-3.5 h-3.5" /> File
        </button>
      </div>

      {mode === 'url' ? (
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://..."
          required={required && !value}
          className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] transition"
        />
      ) : (
        <>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hover:border-[var(--admin-accent)] transition w-full justify-center"
          >
            <Upload className="w-4 h-4" />
            {value ? 'Change image' : 'Choose image'}
          </button>
        </>
      )}

      {value && (
        <div className="mt-2 relative inline-block">
          <img src={value} alt="" className="h-20 rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [extraPhotos, setExtraPhotos] = useState(['', '', '', '', '']);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { getProperties().then(setProperties); }, []);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setExtraPhotos(['', '', '', '', '']);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setForm({
      title: p.title, type: p.type, city: p.city, country: p.country,
      price: p.price, beds: p.beds, baths: p.baths, size: p.size,
      img: p.img, description: p.description,
      features: Array.isArray(p.features) ? p.features.join(', ') : p.features,
    });
    const eps = [...(p.extraPhotos || [])];
    while (eps.length < 5) eps.push('');
    setExtraPhotos(eps.slice(0, 5));
    setEditId(p.id);
    setShowModal(true);
  };

  const setExtra = (i, val) => setExtraPhotos(prev => { const u = [...prev]; u[i] = val; return u; });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const entry = {
      ...form,
      features: form.features.split(',').map(f => f.trim()).filter(Boolean),
      extraPhotos: extraPhotos.filter(Boolean),
    };
    if (editId) {
      const updated = await updateProperty(editId, entry);
      setProperties(list => list.map(p => p.id === editId ? updated : p));
    } else {
      const created = await addProperty(entry);
      setProperties(list => [...list, created]);
    }
    setShowModal(false);
  };

  const handleDelete = async () => {
    await deleteProperty(deleteId);
    setProperties(list => list.filter(p => p.id !== deleteId));
    setDeleteId(null);
  };

  const field = (key) => ({ value: form[key], onChange: e => setForm(f => ({ ...f, [key]: e.target.value })) });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Properties</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{properties.length} total</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[var(--admin-accent)] text-black px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--admin-accent-dark)] transition"
        >
          <Plus className="w-4 h-4" /> Add Property
        </button>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-left">
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Property</th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Type</th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Location</th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Price</th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {properties.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-14 text-gray-400 dark:text-gray-500 text-sm">No properties. Add one above.</td></tr>
              ) : properties.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.img} alt={p.title} className="w-12 h-9 object-cover rounded-lg flex-shrink-0 bg-gray-100 dark:bg-white/10" />
                      <span className="font-medium text-gray-900 dark:text-white max-w-[200px] truncate">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-[color-mix(in_srgb,var(--admin-accent)_10%,transparent)] text-[var(--admin-accent)] px-2.5 py-1 rounded-full text-xs font-medium">{p.type}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{p.city}, {p.country}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{p.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(p.id)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-2xl my-6 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10">
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg">{editId ? 'Edit Property' : 'Add Property'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input {...field('title')} required className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] transition" />
              </div>

              {/* Row: type + price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select {...field('type')} className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] transition">
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price *</label>
                  <input {...field('price')} required placeholder="$1.5M" className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] transition" />
                </div>
              </div>

              {/* Row: city + country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
                  <input {...field('city')} required className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country *</label>
                  <select {...field('country')} required className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] transition">
                    <option value="" disabled>Select a country</option>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Row: beds + baths + size */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beds</label>
                  <input {...field('beds')} placeholder="4 Beds" className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Baths</label>
                  <input {...field('baths')} placeholder="3 Baths" className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Size</label>
                  <input {...field('size')} placeholder="420m²" className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] transition" />
                </div>
              </div>

              {/* Main photo */}
              <PhotoInput
                label="Main Photo *"
                value={form.img}
                onChange={val => setForm(f => ({ ...f, img: val }))}
                required
              />

              {/* Extra photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Additional Photos <span className="text-gray-400 dark:text-gray-500 font-normal">(up to 5, optional)</span>
                </label>
                <div className="space-y-3">
                  {extraPhotos.map((src, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-xs text-gray-400 dark:text-gray-500 mt-3 w-4 flex-shrink-0">{i + 1}.</span>
                      <div className="flex-1">
                        <PhotoInput
                          value={src}
                          onChange={val => setExtra(i, val)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  {...field('description')}
                  rows={3}
                  className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] transition resize-none"
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Features <span className="text-gray-400 dark:text-gray-500 font-normal">(comma-separated)</span>
                </label>
                <input
                  {...field('features')}
                  placeholder="Private Pool, Beach Access, Smart Home"
                  className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] transition"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-[var(--admin-accent)] text-black py-3 rounded-xl text-sm font-semibold hover:bg-[var(--admin-accent-dark)] transition">
                  {editId ? 'Save Changes' : 'Add Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-7 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">Delete Property?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 py-2.5 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
