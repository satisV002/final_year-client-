'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { getApiErrorMessage } from '@/lib/axios';
import { RadioTower, Download, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import FilterBar, { Filters } from '@/components/filters/FilterBar';
import SearchAnimation from '@/components/ui/SearchAnimation';
import { useLocation } from '@/context/LocationContext';

import { fetchAndNormalizeStations, NormalizedStation } from '@/services/station.service';
import StationSummary from '@/components/stations/StationSummary';
import StationCharts from '@/components/stations/StationCharts';
import StationTable from '@/components/stations/StationTable';

export default function StationsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>}>
            <StationsContent />
        </Suspense>
    );
}

function StationsContent() {
    const { location } = useLocation();
    const [filters, setFilters] = useState<Filters>({ state: location.state, district: location.district });
    const [stations, setStations] = useState<NormalizedStation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAndNormalizeStations(filters);
            setStations(data);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const avgLevel = stations.length ? stations.reduce((a: number, b: NormalizedStation) => a + b.groundwaterLevel, 0) / stations.length : 0;
    const criticalCount = stations.filter(s => s.groundwaterLevel > 10).length;

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-20 p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <RadioTower className="w-8 h-8 text-emerald-500" />
                        STATIONS <span className="text-emerald-500/50">DATABASE</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">National Groundwater Monitoring Infrastructure & Real-time Analytics</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={loadData} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-300 hover:bg-slate-800 transition-all disabled:opacity-50">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Refresh
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition-all">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <FilterBar value={filters} onChange={setFilters} onSyncComplete={loadData} />

            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
            )}

            {loading && stations.length === 0 ? (
                <div className="py-24"><SearchAnimation /></div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <StationSummary total={stations.length} avgLevel={avgLevel} criticalCount={criticalCount} />

                    {/* Charts Section */}
                    <div className="py-2">
                        <StationCharts data={stations} />
                    </div>

                    {/* Table Section */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2 px-2">
                             Detailed Station Records
                             <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">Live Dataset</span>
                        </h2>
                        <StationTable stations={stations} />
                    </div>
                </>
            )}
        </div>
    );
}
