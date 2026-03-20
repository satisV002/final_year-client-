import api from '@/lib/axios';

export interface NormalizedStation {
    stationName: string;
    state: string;
    district: string;
    groundwaterLevel: number;
    rainfall: number;
    date: string;
    trend?: string;
    agency?: string;
}

export const fetchAndNormalizeStations = async (params: any): Promise<NormalizedStation[]> => {
    // Increase limit to 500 for better chart coverage
    const res = await api.get('/mock/groundwater', { params: { ...params, limit: '500' } });
    const rawData = res.data.data ?? [];

    return rawData.map((s: any) => ({
        stationName: s.location?.stationName || s.location?.stationId || 'Unknown',
        state: s.location?.state || 'Unknown',
        district: s.location?.district || 'Unknown',
        groundwaterLevel: s.waterLevelMbgl || 0,
        rainfall: s.rainfallMm || (Math.random() * 100 + 50), // Mock rainfall if missing
        date: s.date || new Date().toISOString(),
        trend: s.trend || 'Stable',
        agency: s.source || 'CGWB'
    }));
};
