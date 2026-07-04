import { useState, useEffect } from 'react';
import { Mail, Trash2 } from 'lucide-react';
import { getSubscribers, deleteSubscriber } from '../../utils/storage';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => { getSubscribers().then(setSubscribers); }, []);

  const handleDelete = async (id) => {
    await deleteSubscriber(id);
    setSubscribers(list => list.filter(s => s.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Newsletter</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-16 text-center">
          <Mail className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 dark:text-gray-500 text-sm">No subscribers yet. Newsletter sign-ups will appear here.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-left">
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Email</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Subscribed</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {subscribers.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[color-mix(in_srgb,var(--admin-accent)_15%,transparent)] flex items-center justify-center text-[var(--admin-accent)] flex-shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{s.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
