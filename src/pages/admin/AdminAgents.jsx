import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Link2 } from 'lucide-react';
import { getAgents, addAgent, updateAgent, deleteAgent } from '../../utils/storage';

const EMPTY_FORM = { name: '', role: '', bio: '', img: '', type: 'expert', languages: '', phone: '', email: '' };

export default function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imgMode, setImgMode] = useState('url');
  const [deleteId, setDeleteId] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { getAgents().then(setAgents); }, []);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setImgMode('url');
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (a) => {
    setForm({ name: a.name, role: a.role, bio: a.bio || '', img: a.img, type: a.type, languages: a.languages || '', phone: a.phone || '', email: a.email || '' });
    setImgMode('url');
    setEditId(a.id);
    setShowModal(true);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, img: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      const updated = await updateAgent(editId, form);
      setAgents(list => list.map(a => a.id === editId ? updated : a));
    } else {
      const created = await addAgent(form);
      setAgents(list => [...list, created]);
    }
    setShowModal(false);
  };

  const handleDelete = async () => {
    await deleteAgent(deleteId);
    setAgents(list => list.filter(a => a.id !== deleteId));
    setDeleteId(null);
  };

  const field = (key) => ({ value: form[key], onChange: e => setForm(f => ({ ...f, [key]: e.target.value })) });

  const founders = agents.filter(a => a.type === 'founder');
  const experts = agents.filter(a => a.type === 'expert');

  const AgentCard = ({ a }) => (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden hover:shadow-md transition group">
      <div className="relative">
        <img src={a.img} alt={a.name} className="w-full h-40 object-cover bg-gray-100 dark:bg-white/10" />
        <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold
          ${a.type === 'founder' ? 'bg-[var(--admin-accent)] text-black' : 'bg-gray-900 text-white'}`}>
          {a.type === 'founder' ? 'Founder' : 'Expert'}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{a.name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.role}</p>
        {a.bio && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2">{a.bio}</p>}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => openEdit(a)}
            className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 py-1.5 rounded-lg text-xs hover:bg-gray-50 dark:hover:bg-white/5 transition"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => setDeleteId(a.id)}
            className="flex-1 flex items-center justify-center gap-1.5 border border-red-100 text-red-500 py-1.5 rounded-lg text-xs hover:bg-red-50 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agents</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{agents.length} total · {founders.length} founders · {experts.length} experts</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[var(--admin-accent)] text-black px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--admin-accent-dark)] transition"
        >
          <Plus className="w-4 h-4" /> Add Agent
        </button>
      </div>

      {agents.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-16 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">No agents yet. Add one above.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {founders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Founders</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {founders.map(a => <AgentCard key={a.id} a={a} />)}
              </div>
            </div>
          )}
          {experts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Experts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {experts.map(a => <AgentCard key={a.id} a={a} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10">
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg">{editId ? 'Edit Agent' : 'Add Agent'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input {...field('name')} required className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role *</label>
                <input {...field('role')} required className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <div className="flex gap-3">
                  {['expert', 'founder'].map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="agent-type"
                        value={t}
                        checked={form.type === t}
                        onChange={() => setForm(f => ({ ...f, type: t }))}
                        className="accent-[var(--admin-accent)]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photo</label>
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => setImgMode('url')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${imgMode === 'url' ? 'bg-[var(--admin-accent)] text-black border-[var(--admin-accent)]' : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400'}`}>
                    <Link2 className="w-3.5 h-3.5" /> URL
                  </button>
                  <button type="button" onClick={() => setImgMode('file')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${imgMode === 'file' ? 'bg-[var(--admin-accent)] text-black border-[var(--admin-accent)]' : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400'}`}>
                    <Upload className="w-3.5 h-3.5" /> File
                  </button>
                </div>
                {imgMode === 'url' ? (
                  <input {...field('img')} type="url" placeholder="https://..." className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] transition" />
                ) : (
                  <>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                    <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hover:border-[var(--admin-accent)] transition w-full justify-center">
                      <Upload className="w-4 h-4" /> {form.img ? 'Change image' : 'Choose image'}
                    </button>
                  </>
                )}
                {form.img && <img src={form.img} alt="" className="mt-2 h-20 rounded-lg object-cover" />}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                <textarea {...field('bio')} rows={2} className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] transition resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Languages</label>
                <input {...field('languages')} placeholder="English, French, Spanish" className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input {...field('phone')} type="tel" placeholder="+1 (310) 555-0123" className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input {...field('email')} type="email" placeholder="name@terra.com" className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] transition" />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 py-3 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition">Cancel</button>
                <button type="submit" className="flex-1 bg-[var(--admin-accent)] text-black py-3 rounded-xl text-sm font-semibold hover:bg-[var(--admin-accent-dark)] transition">{editId ? 'Save' : 'Add Agent'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-7 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">Delete Agent?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 py-2.5 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/5">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
