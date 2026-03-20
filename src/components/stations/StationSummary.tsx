import { RadioTower, Droplets, AlertCircle, Activity } from 'lucide-react';

interface Props {
    total: number;
    avgLevel: number;
    criticalCount: number;
}

export default function StationSummary({ total, avgLevel, criticalCount }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <RadioTower className="w-12 h-12 text-emerald-400" />
                </div>
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Total Stations</p>
                <p className="text-4xl font-black text-white tabular-nums">{total}</p>
                <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Active Monitoring Nodes
                </p>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Droplets className="w-12 h-12 text-cyan-400" />
                </div>
                <p className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-1">Avg Depth (MBGL)</p>
                <p className="text-4xl font-black text-white tabular-nums">{avgLevel.toFixed(2)}<span className="text-sm ml-1 font-medium text-slate-500">m</span></p>
                <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Regional Mean Level
                </p>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/30 transition-all">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <AlertCircle className="w-12 h-12 text-red-400" />
                </div>
                <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Critical Zones</p>
                <p className="text-4xl font-black text-white tabular-nums">{criticalCount}</p>
                <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Stations &gt; 10m Depth
                </p>
            </div>
        </div>
    );
}
