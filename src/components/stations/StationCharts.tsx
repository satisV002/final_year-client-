import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { NormalizedStation } from '@/services/station.service';

interface Props {
    data: NormalizedStation[];
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e', '#ec4899'];

export default function StationCharts({ data }: Props) {
    // 1. Bar Chart: Top 10 Districts by Avg Level
    const districtAvg = Object.values(data.reduce((acc: any, curr) => {
        if (!acc[curr.district]) acc[curr.district] = { name: curr.district, sum: 0, count: 0 };
        acc[curr.district].sum += curr.groundwaterLevel;
        acc[curr.district].count += 1;
        return acc;
    }, {})).map((d: any) => ({ name: d.name, avg: +(d.sum / d.count).toFixed(2) }))
        .sort((a, b) => b.avg - a.avg).slice(0, 10);

    // 2. Line Chart: Monthly Trend (Recent 12 months)
    const monthlyTrend = Object.values(data.reduce((acc: any, curr) => {
        const month = new Date(curr.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        if (!acc[month]) acc[month] = { name: month, level: 0, count: 0, date: new Date(curr.date) };
        acc[month].level += curr.groundwaterLevel;
        acc[month].count += 1;
        return acc;
    }, {})).sort((a: any, b: any) => a.date - b.date);

    // 3. Pie Chart: State-wise Station Distribution
    const stateDist = Object.values(data.reduce((acc: any, curr) => {
        if (!acc[curr.state]) acc[curr.state] = { name: curr.state, value: 0 };
        acc[curr.state].value += 1;
        return acc;
    }, {}));

    // 4. Scatter Plot: Rainfall vs Groundwater
    const scatterData = data.slice(0, 50).map(s => ({ x: s.rainfall, y: s.groundwaterLevel, name: s.stationName }));

    // 5. Area Chart: Seasonal Levels (Last 12 readings)
    const seasonalData = data.slice(0, 12).reverse().map(s => ({
        name: new Date(s.date).toLocaleDateString('en-IN', { month: 'short' }),
        level: s.groundwaterLevel
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl text-xs">
                <p className="text-slate-400 mb-1 font-semibold">{label}</p>
                {payload.map((p: any) => (
                    <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
                        {p.name}: {p.value}{p.name.includes('Level') || p.name.includes('Depth') ? 'm' : 'mm'}
                    </p>
                ))}
            </div>
        );
    };

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 border border-white/5 rounded-3xl">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <BarChart className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-white">No Analytics Data Available</h3>
                <p className="text-slate-500 text-sm max-w-xs text-center mt-2">
                    Try adjusting your filters or syncing new data for this region to see trends and distribution.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

            {/* 1. Top 10 Districts Bar */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 xl:col-span-2">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-cyan-500 rounded-full"></span>
                    Top 10 Districts by Groundwater Depth
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={districtAvg} margin={{ left: -10, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} unit="m" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="avg" name="Avg Depth" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 3. State Pie */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                    State-wise Distribution
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie data={stateDist} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                            {stateDist.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* 2. Monthly Trend Line */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 xl:col-span-2">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                    Aggregated Monthly Trend
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} unit="m" />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="level" name="Mean Level" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0f172a' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* 4. Scatter Rainfall vs Level */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                    Rainfall vs. Depth Correlation
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis type="number" dataKey="x" name="Rainfall" unit="mm" stroke="#64748b" fontSize={10} />
                        <YAxis type="number" dataKey="y" name="Level" unit="m" stroke="#64748b" fontSize={10} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Stations" data={scatterData} fill="#f59e0b" />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            {/* 5. Seasonal Area Chart */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 xl:col-span-3">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-pink-500 rounded-full"></span>
                    Recent Seasonal Oscillations
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={seasonalData}>
                        <defs>
                            <linearGradient id="colorLvl" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="level" stroke="#ec4899" fillOpacity={1} fill="url(#colorLvl)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
