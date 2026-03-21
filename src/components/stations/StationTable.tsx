import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from 'lucide-react';
import { NormalizedStation } from '@/services/station.service';

interface Props {
    stations: NormalizedStation[];
}

const PAGE_SIZE = 15;

export default function StationTable({ stations }: Props) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<{ key: keyof NormalizedStation, dir: 'asc' | 'desc' } | null>(null);

    // Apply Filter
    const filtered = stations.filter(s => 
        s.stationName.toLowerCase().includes(search.toLowerCase()) ||
        s.state.toLowerCase().includes(search.toLowerCase()) ||
        s.district.toLowerCase().includes(search.toLowerCase())
    );

    // Apply Sort
    const sorted = [...filtered].sort((a, b) => {
        if (!sort) return 0;
        const v1 = a[sort.key];
        const v2 = b[sort.key];
        if (typeof v1 === 'string' && typeof v2 === 'string') {
            return sort.dir === 'asc' ? v1.localeCompare(v2) : v2.localeCompare(v1);
        }
        if (typeof v1 === 'number' && typeof v2 === 'number') {
            return sort.dir === 'asc' ? v1 - v2 : v2 - v1;
        }
        return 0;
    });

    const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
    const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const toggleSort = (key: keyof NormalizedStation) => {
        setSort(prev => {
            if (prev?.key === key) {
                return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
            }
            return { key, dir: 'desc' };
        });
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search stations, states, or districts..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-slate-600"
                />
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th onClick={() => toggleSort('stationName')} className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-[10px] cursor-pointer hover:text-white transition-colors">
                                    <div className="flex items-center gap-2">Station Name <ArrowUpDown className="w-3 h-3 opacity-30" /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">State</th>
                                <th className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">District</th>
                                <th onClick={() => toggleSort('groundwaterLevel')} className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-[10px] cursor-pointer hover:text-white transition-colors">
                                    <div className="flex items-center gap-2">Level (MBGL) <ArrowUpDown className="w-3 h-3 opacity-30" /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Rainfall (mm)</th>
                                <th onClick={() => toggleSort('date')} className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-[10px] cursor-pointer hover:text-white transition-colors">
                                    <div className="flex items-center gap-2">Date <ArrowUpDown className="w-3 h-3 opacity-30" /></div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {paginated.length > 0 ? paginated.map((s, i) => (
                                <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-6 py-4 font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">{s.stationName}</td>
                                    <td className="px-6 py-4 text-slate-400">{s.state}</td>
                                    <td className="px-6 py-4 text-slate-500">{s.district}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            s.groundwaterLevel > 10 ? 'bg-red-500/10 text-red-400' : 
                                            s.groundwaterLevel > 5 ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'
                                        }`}>
                                            {s.groundwaterLevel.toFixed(2)}m
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{s.rainfall.toFixed(1)}</td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                                        No stations match your search or filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <p className="text-xs text-slate-500">
                            Showing <span className="text-slate-300">{(page-1)*PAGE_SIZE + 1}</span> to <span className="text-slate-300">{Math.min(page*PAGE_SIZE, sorted.length)}</span> of <span className="text-slate-300">{sorted.length}</span> stations
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-all shadow-lg">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-all shadow-lg">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
