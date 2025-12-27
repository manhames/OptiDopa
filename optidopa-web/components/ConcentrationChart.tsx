'use client';

import { ConcentrationPoint, Dose, PK_PARAMS } from '@/lib/pharmacokinetics';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { Download } from 'lucide-react';

interface ConcentrationChartProps {
  profile: ConcentrationPoint[];
  doses: Dose[];
}

export default function ConcentrationChart({ profile, doses }: ConcentrationChartProps) {
  // Format data for Recharts
  const chartData = profile.map(point => ({
    time: point.time,
    timeStr: format(point.time, 'HH:mm'),
    concentration: point.concentration,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {format(data.time, 'MMM dd, HH:mm')}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            {data.concentration.toFixed(1)} ng/mL
          </p>
        </div>
      );
    }
    return null;
  };

  const exportToCSV = () => {
    const headers = ['Time', 'Concentration (ng/mL)'];
    const rows = profile.map(p => [
      format(p.time, 'yyyy-MM-dd HH:mm'),
      p.concentration.toFixed(2),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `levodopa_profile_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (profile.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Add doses to see the plasma concentration profile
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* Therapeutic zones */}
          <ReferenceArea
            y1={PK_PARAMS.C_target_low}
            y2={PK_PARAMS.C_target_high}
            fill="#10b981"
            fillOpacity={0.1}
            label={{ value: 'Optimal Range', position: 'insideTopRight', fill: '#059669' }}
          />
          <ReferenceArea
            y1={PK_PARAMS.C_min}
            y2={PK_PARAMS.C_target_low}
            fill="#fbbf24"
            fillOpacity={0.1}
          />
          <ReferenceArea
            y1={PK_PARAMS.C_target_high}
            y2={2500}
            fill="#ef4444"
            fillOpacity={0.1}
            label={{ value: 'Dyskinesia Risk', position: 'insideTopRight', fill: '#dc2626' }}
          />

          {/* Reference lines */}
          <ReferenceLine
            y={PK_PARAMS.C_min}
            stroke="#f59e0b"
            strokeDasharray="3 3"
            label={{ value: 'Min Effective (800)', position: 'right', fill: '#d97706' }}
          />
          <ReferenceLine
            y={PK_PARAMS.C_target_low}
            stroke="#10b981"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={PK_PARAMS.C_target_high}
            stroke="#ef4444"
            strokeDasharray="3 3"
          />

          {/* Dose markers */}
          {doses.map((dose, idx) => {
            const doseTime = format(dose.datetime, 'HH:mm');
            const doseDate = format(dose.datetime, 'MMM dd');
            return (
              <ReferenceLine
                key={dose.id}
                x={chartData.findIndex(d => d.timeStr === doseTime)}
                stroke="#6b7280"
                strokeDasharray="2 2"
                label={{
                  value: `${doseDate} ${doseTime}: ${dose.doseMg}mg ${dose.formulation}`,
                  position: 'top',
                  fill: '#4b5563',
                  fontSize: 10,
                }}
              />
            );
          })}

          <XAxis
            dataKey="timeStr"
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            interval={Math.floor(chartData.length / 12)}
          />
          <YAxis
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{
              value: 'Plasma Concentration (ng/mL)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#6b7280', fontSize: 12 },
            }}
            domain={[0, 2500]}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />

          <Line
            type="monotone"
            dataKey="concentration"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
            name="Levodopa Concentration"
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend for zones */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 dark:bg-green-900/30 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">
            Optimal Range (1000-1600 ng/mL)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-900/30 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">
            Sub-optimal (800-1000 ng/mL)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 dark:bg-red-900/30 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">
            Dyskinesia Risk (&gt;1600 ng/mL)
          </span>
        </div>
      </div>
    </div>
  );
}
