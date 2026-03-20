import { useState, useEffect } from 'react';
import { Filter, CalendarRange, X, RefreshCw, Loader2, Activity, AlertTriangle } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { INDIA_STATES } from '@/lib/constants';
import api, { getApiErrorMessage } from '@/lib/axios';

export interface Filters {
    state?: string;
    district?: string;
    stationId?: string;
    fromDate?: string;
    toDate?: string;
}

interface FilterBarProps {
    value: Filters;
    onChange: (f: Filters) => void;
    onSyncComplete?: () => void;
    hideGlobalState?: boolean;
}

export default function FilterBar({ value, onChange, onSyncComplete, hideGlobalState = false }: FilterBarProps) {
    const { location, setLocation } = useLocation();
    const [expanded, setExpanded] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    // Sync context with local state changes if state changes in FilterBar
    const update = (key: keyof Filters, val: string) => {
        const newVal = val || undefined;
        onChange({ ...value, [key]: newVal });
        
        // If state changed, update global context too
        if (key === 'state') {
            setLocation({ state: val || 'All India', district: undefined });
        }
        // If district changed, update global context too
        if (key === 'district') {
            setLocation({ ...location, district: newVal });
        }
    };

    const handleSync = async () => {
        if (!value.state || value.state === 'All India' || !value.district) return;
        
        setSyncing(true);
        setSyncStatus(null);
        try {
            await api.post('/sync', {
                state: value.state,
                district: value.district
            });
            setSyncStatus({ type: 'success', msg: `Sync started for ${value.district}.` });
            if (onSyncComplete) onSyncComplete();
            setTimeout(() => setSyncStatus(null), 5000);
        } catch (err) {
            setSyncStatus({ type: 'error', msg: 'Sync failed: ' + getApiErrorMessage(err) });
        } finally {
            setSyncing(false);
        }
    };

    const clear = () => onChange({ state: value.state });

    const active = !!(value.district || value.stationId || value.fromDate || value.toDate);

    return (
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 shadow-xl">
            <div className="flex flex-wrap items-center gap-3">
                {/* State */}
                {!hideGlobalState && (
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-500 whitespace-nowrap">State</label>
                        <select
                            value={value.state ?? location.state}
                            onChange={e => update('state', e.target.value)}
                            className="bg-slate-800 border border-white/10 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                        >
                            {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                )}

                {/* Toggle more filters */}
                <button
                    onClick={() => setExpanded(e => !e)}
                    className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-sm transition-all ${active ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-800 border-white/10 text-slate-400 hover:text-slate-200'
                        }`}
                >
                    <Filter className="w-4 h-4" />
                    More Filters
                    {active && <span className="w-2 h-2 bg-cyan-500 rounded-full" />}
                </button>

                {active && (
                    <button onClick={clear} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                        <X className="w-3 h-3" /> Clear
                    </button>
                )}

                <div className="ml-auto flex items-center gap-3">
                    {syncStatus && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs animate-in fade-in slide-in-from-right-4 ${
                            syncStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                            {syncStatus.type === 'success' ? <Activity className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            {syncStatus.msg}
                        </div>
                    )}
                    
                    {value.state && value.state !== 'All India' && value.district && (
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl text-sm text-emerald-400 transition-all disabled:opacity-50"
                        >
                            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            <span className="hidden sm:inline">Sync Live</span>
                        </button>
                    )}
                </div>
            </div>

            {expanded && (
                <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/5">
                    {/* District */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-500 whitespace-nowrap">District</label>
                        <input
                            type="text" placeholder="e.g. Baleshwar"
                            value={value.district ?? ''}
                            onChange={e => update('district', e.target.value)}
                            className="bg-slate-800 border border-white/10 text-slate-200 text-sm rounded-xl px-3 py-2 w-36 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 placeholder-slate-600"
                        />
                    </div>

                    {/* Station ID */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-500 whitespace-nowrap">Station ID</label>
                        <input
                            type="text" placeholder="e.g. CGWBHU2326"
                            value={value.stationId ?? ''}
                            onChange={e => update('stationId', e.target.value)}
                            className="bg-slate-800 border border-white/10 text-slate-200 text-sm rounded-xl px-3 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 placeholder-slate-600"
                        />
                    </div>

                    {/* Date range */}
                    <div className="flex items-center gap-2">
                        <CalendarRange className="w-4 h-4 text-slate-500" />
                        <input
                            type="date" value={value.fromDate ?? ''}
                            onChange={e => update('fromDate', e.target.value)}
                            className="bg-slate-800 border border-white/10 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        />
                        <span className="text-slate-600 text-xs">to</span>
                        <input
                            type="date" value={value.toDate ?? ''}
                            onChange={e => update('toDate', e.target.value)}
                            className="bg-slate-800 border border-white/10 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
