import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, ShieldCheck, AlertTriangle, Info, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_BADGES = {
  Essential: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  Expected: 'bg-green-500/10 text-green-300 border-green-500/30',
  Optional: 'bg-green-600/10 text-green-400 border-green-600/20',
  Suspicious: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  'High Risk': 'bg-red-500/15 text-red-300 border-red-500/40',
};

const RISK_BADGES = {
  Low: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
  High: 'bg-orange-950/60 text-orange-300 border-orange-500/30',
  Critical: 'bg-rose-950/80 text-rose-300 border-rose-500/50 animate-pulse',
};

export default function PermissionTable({ permissions = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT'); // DEFAULT | NAME | RISK
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (idx) => {
    setExpandedRows(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const filteredPermissions = useMemo(() => {
    return permissions.filter(item => {
      const pName = (item.name || '').toLowerCase();
      const pReason = (item.reason || '').toLowerCase();
      const sTerm = searchTerm.toLowerCase();

      const matchesSearch = pName.includes(sTerm) || pReason.includes(sTerm);
      const matchesStatus = statusFilter === 'ALL' || item.status?.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'NAME') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'RISK') {
        const order = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return (order[b.risk] || 0) - (order[a.risk] || 0);
      }
      return 0;
    });
  }, [permissions, searchTerm, statusFilter, sortBy]);

  return (
    <div className="space-y-4">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-wide font-display flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            Permission Intelligence Analysis ({filteredPermissions.length})
          </h3>
          <p className="text-xs text-slate-400">Contextual evaluation of each requested system capability</p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 pr-3 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-green-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ESSENTIAL">Essential</option>
            <option value="EXPECTED">Expected</option>
            <option value="OPTIONAL">Optional</option>
            <option value="SUSPICIOUS">Suspicious</option>
            <option value="HIGH RISK">High Risk</option>
          </select>

          {/* Sort Button */}
          <button
            onClick={() => setSortBy(prev => (prev === 'DEFAULT' ? 'RISK' : prev === 'RISK' ? 'NAME' : 'DEFAULT'))}
            className="h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center space-x-1.5 transition-all"
          >
            <ArrowUpDown className="w-3 h-3 text-green-400" />
            <span>Sort: {sortBy}</span>
          </button>
        </div>
      </div>

      {/* Modern Cybersecurity Permission Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
        <table className="w-full text-left text-xs border-collapse">
          {/* Sticky Header */}
          <thead className="bg-slate-950/80 sticky top-0 z-10 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Permission</th>
              <th className="py-3 px-4 hidden md:table-cell">Stated Purpose</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Risk Level</th>
              <th className="py-3 px-4">Contextual Reason</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-white/5 text-slate-300">
            {filteredPermissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                  No permissions match the current filter criteria.
                </td>
              </tr>
            ) : (
              filteredPermissions.map((item, idx) => {
                const isExpanded = expandedRows[idx];
                const statusStyle = STATUS_BADGES[item.status] || STATUS_BADGES.Expected;
                const riskStyle = RISK_BADGES[item.risk] || RISK_BADGES.Low;

                return (
                  <React.Fragment key={idx}>
                    <tr 
                      onClick={() => toggleRow(idx)}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      {/* Permission Name */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-200 group-hover:text-green-400 transition-colors">
                        <div className="flex items-center space-x-2">
                          <span>{item.name}</span>
                        </div>
                      </td>

                      {/* Purpose */}
                      <td className="py-3.5 px-4 text-slate-400 hidden md:table-cell max-w-[200px] truncate">
                        {item.purpose || 'System access'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${statusStyle}`}>
                          {item.status || 'Expected'}
                        </span>
                      </td>

                      {/* Risk */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-extrabold tracking-wider border ${riskStyle}`}>
                          {item.risk || 'Low'}
                        </span>
                      </td>

                      {/* Contextual Reason */}
                      <td className="py-3.5 px-4 max-w-[300px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 truncate pr-2">
                            {item.reason}
                          </span>
                          <span className="text-slate-500 group-hover:text-green-500 transition-colors">
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable row detail */}
                    {isExpanded && (
                      <tr className="bg-green-500/5 border-b border-green-500/20">
                        <td colSpan={5} className="p-4 space-y-2">
                          <div className="flex items-start space-x-2 text-slate-200">
                            <Info className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-green-300">Detailed AI Context:</p>
                              <p className="text-xs leading-relaxed text-slate-300 bg-black/40 p-3 rounded-lg border border-white/5">
                                {item.reason}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
