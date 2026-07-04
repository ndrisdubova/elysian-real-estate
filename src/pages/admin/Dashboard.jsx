import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, MessageSquare } from 'lucide-react';
import { getProperties, getAgents, getMessages } from '../../utils/storage';

export default function Dashboard() {
  const [stats, setStats] = useState({ props: 0, agents: 0, msgs: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const props = getProperties();
    const agents = getAgents();
    const msgs = getMessages();
    setStats({ props: props.length, agents: agents.length, msgs: msgs.length });
    setRecent(msgs.slice(0, 6));
  }, []);

  const cards = [
    { label: 'Total Properties', value: stats.props, Icon: Building2, to: '/admin/properties', bg: 'bg-blue-500' },
    { label: 'Total Agents', value: stats.agents, Icon: Users, to: '/admin/agents', bg: 'bg-violet-500' },
    { label: 'Total Messages', value: stats.msgs, Icon: MessageSquare, to: '/admin/messages', bg: 'bg-emerald-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome back, Admin</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value, Icon, to, bg }) => (
          <Link
            key={label}
            to={to}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-md transition group"
          >
            <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Messages</h2>
          <Link to="/admin/messages" className="text-sm text-[var(--admin-accent)] hover:underline">View all →</Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-14">
            <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-gray-500 text-sm">No messages yet. They'll appear here when visitors contact you.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {recent.map(msg => (
              <Link
                key={msg.id}
                to="/admin/messages"
                className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400 flex-shrink-0 uppercase">
                  {(msg.firstName || msg.name || '?')[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium truncate text-gray-600 dark:text-gray-400">
                      {msg.firstName ? `${msg.firstName} ${msg.lastName || ''}` : msg.name}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto flex-shrink-0">
                      {new Date(msg.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{msg.subject || msg.message || '(no subject)'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
