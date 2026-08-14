import React, { useState } from 'react';
import { ShieldAlert, Plus, X, Check, Terminal } from 'lucide-react';

const COMMON_PERMISSIONS = [
  'android.permission.CAMERA',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.RECORD_AUDIO',
  'android.permission.READ_CONTACTS',
  'android.permission.WRITE_CONTACTS',
  'android.permission.SEND_SMS',
  'android.permission.RECEIVE_SMS',
  'android.permission.READ_SMS',
  'android.permission.READ_PHONE_STATE',
  'android.permission.CALL_PHONE',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.GET_ACCOUNTS',
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.BLUETOOTH',
  'android.permission.BLUETOOTH_CONNECT',
  'android.permission.VIBRATE',
  'android.permission.INTERNET'
];

const CATEGORIES = [
  'Music', 'Video', 'Streaming', 'Maps', 'Navigation', 'Shopping', 'Social', 'Messaging', 
  'Video Call', 'Email', 'Banking', 'UPI', 'Wallet', 'Healthcare', 'Fitness', 'Camera', 
  'Gallery', 'Browser', 'VPN', 'Developer Tools', 'Notes', 'Education', 'Gaming', 'News', 
  'Productivity', 'Weather', 'Travel', 'Transportation', 'Finance', 'Government', 'Enterprise', 
  'Calculator', 'Flashlight', 'Wallpaper', 'QR Scanner', 'Photo Editor', 'Utility'
];

export default function ManualForm({ isOpen, onToggle, onSubmit, warningMessage, isAnalyzing }) {
  const [selectedCategory, setSelectedCategory] = useState('Utility');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [customPermission, setCustomPermission] = useState('');

  const handleTogglePermission = (perm) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const handleAddCustomPermission = (e) => {
    e.preventDefault();
    const cleaned = customPermission.trim();
    if (cleaned && !selectedPermissions.includes(cleaned)) {
      setSelectedPermissions([...selectedPermissions, cleaned]);
      setCustomPermission('');
    }
  };

  const handleRemovePermission = (perm) => {
    setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    onSubmit({
      category: selectedCategory,
      permissions: selectedPermissions
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      {isOpen && warningMessage && (
        <div className="flex items-start p-4 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200">
          <ShieldAlert className="w-5 h-5 mr-3 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Automated Scraping Fallback</p>
            <p className="text-xs text-red-300/95 mt-0.5">{warningMessage}</p>
            <p className="text-xs font-semibold text-indigo-400 mt-1">Please specify app category and permissions below.</p>
          </div>
        </div>
      )}

      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        <button
          onClick={onToggle}
          type="button"
          className="w-full px-6 py-4 flex items-center justify-between text-left border-b border-white/5 bg-white/2 hover:bg-white/5 transition-all"
        >
          <div className="flex items-center space-x-3">
            <Terminal className="w-5 h-5 text-green-500" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-green-400">Manual Entry Mode</span>
              <h3 className="text-base font-bold text-white tracking-wide font-display">Declare Category & Permissions Manually</h3>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-slate-300 font-semibold uppercase">
            {isOpen ? 'Collapse' : 'Expand'}
          </span>
        </button>

        {isOpen && (
          <form onSubmit={handleSubmitForm} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                App Category Baseline ({CATEGORIES.length} Categories Supported)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-black/60 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-green-500 transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Quick Select Common Permissions
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_PERMISSIONS.map((perm) => {
                  const shortName = perm.split('.').pop();
                  const isChecked = selectedPermissions.includes(perm);
                  return (
                    <button
                      key={perm}
                      type="button"
                      onClick={() => handleTogglePermission(perm)}
                      className={`flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isChecked
                          ? 'bg-green-500/20 border-green-500 text-green-400 shadow-md shadow-green-500/5'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 mr-1 text-green-500" />}
                      {shortName}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Or Add Custom Android Permission String
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. android.permission.BLUETOOTH_CONNECT"
                  value={customPermission}
                  onChange={(e) => setCustomPermission(e.target.value)}
                  className="flex-1 h-11 px-4 rounded-xl bg-black/60 border border-white/10 text-sm text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-green-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddCustomPermission}
                  className="h-11 px-4 bg-white/10 border border-white/10 rounded-xl text-white flex items-center hover:border-green-500 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </button>
              </div>
            </div>

            {selectedPermissions.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Staged Permissions ({selectedPermissions.length})
                </label>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-black/50 border border-white/5 max-h-36 overflow-y-auto">
                  {selectedPermissions.map((perm) => (
                    <span
                      key={perm}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono"
                    >
                      {perm}
                      <button
                        type="button"
                        onClick={() => handleRemovePermission(perm)}
                        className="ml-1.5 text-green-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isAnalyzing || selectedPermissions.length === 0}
              className="w-full h-12 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-green-500/10 disabled:opacity-40 active:scale-[0.99]"
            >
              {isAnalyzing ? 'Analyzing Permissions...' : 'Run Contextual Risk Analysis'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
