import { useOutletContext } from 'react-router-dom';
import { Check, RotateCcw, Sun, Moon } from 'lucide-react';

const DEFAULT_COLOR = '#C0A067';

const PRESETS = [
  { name: 'Gold', value: '#C0A067' },
  { name: 'Royal Blue', value: '#3B5BA5' },
  { name: 'Emerald', value: '#2F855A' },
  { name: 'Ruby', value: '#B23A48' },
  { name: 'Slate', value: '#4B5563' },
  { name: 'Violet', value: '#6D4AFF' },
];

export default function AdminSettings() {
  const { accentColor, setAccentColor, theme, setTheme } = useOutletContext();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize how your admin panel looks.</p>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-6 md:p-8 max-w-2xl mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Appearance</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Choose how the admin panel looks on this device.</p>

        <div className="flex gap-3">
          {[
            { value: 'light', label: 'Light', Icon: Sun },
            { value: 'dark', label: 'Dark', Icon: Moon },
          ].map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border transition
                ${theme === value
                  ? 'bg-[var(--admin-accent)] text-black border-[var(--admin-accent)]'
                  : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20'}`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-6 md:p-8 max-w-2xl">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Accent Color</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Used for buttons, active nav items, and highlights across the admin panel.</p>

        <div className="flex flex-wrap gap-3 mb-6">
          {PRESETS.map(p => (
            <button
              key={p.value}
              onClick={() => setAccentColor(p.value)}
              title={p.name}
              className="w-11 h-11 rounded-full flex items-center justify-center transition ring-2 ring-offset-2"
              style={{
                backgroundColor: p.value,
                '--tw-ring-color': accentColor.toLowerCase() === p.value.toLowerCase() ? p.value : 'transparent',
              }}
            >
              {accentColor.toLowerCase() === p.value.toLowerCase() && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom color</label>
          <input
            type="color"
            value={accentColor}
            onChange={e => setAccentColor(e.target.value)}
            className="w-11 h-11 rounded-lg border border-gray-200 dark:border-white/10 cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={accentColor}
            onChange={e => setAccentColor(e.target.value)}
            className="border border-gray-200 dark:border-white/10 dark:bg-[#0f0f0f] dark:text-white rounded-xl px-3 py-2 text-sm w-28 outline-none focus:border-[var(--admin-accent)] transition uppercase"
          />
          <button
            onClick={() => setAccentColor(DEFAULT_COLOR)}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to default
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Preview</p>
          <div className="flex items-center gap-4 flex-wrap">
            <button className="bg-[var(--admin-accent)] text-black px-4 py-2.5 rounded-xl font-semibold text-sm">
              Sample Button
            </button>
            <span className="bg-[color-mix(in_srgb,var(--admin-accent)_10%,transparent)] text-[var(--admin-accent)] px-3 py-1 rounded-full text-xs font-medium">
              Sample Badge
            </span>
            <div className="w-9 h-9 bg-[var(--admin-accent)] rounded-full flex items-center justify-center text-black font-bold text-sm">A</div>
          </div>
        </div>
      </div>
    </div>
  );
}
