'use client';

import { ConcentrationStats } from '@/lib/pharmacokinetics';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, Pill } from 'lucide-react';

interface StatsPanelProps {
  stats: ConcentrationStats;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {/* Peak Concentration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Peak</div>
          <TrendingUp className="text-green-500" size={20} />
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {stats.peakConcentration.toFixed(0)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">ng/mL</div>
      </div>

      {/* Trough Concentration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Trough</div>
          <TrendingDown className="text-blue-500" size={20} />
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {stats.troughConcentration.toFixed(0)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">ng/mL</div>
      </div>

      {/* Time in Optimal Range */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">In Range</div>
          <Activity className="text-green-500" size={20} />
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {stats.percentInOptimalRange.toFixed(1)}%
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Optimal (1000-1600)</div>
      </div>

      {/* Dyskinesia Risk */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Risk Zone</div>
          <AlertTriangle className="text-red-500" size={20} />
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {stats.percentInDyskinesia.toFixed(1)}%
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Above 1600 ng/mL</div>
      </div>

      {/* Total Daily Dose */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Dose</div>
          <Pill className="text-purple-500" size={20} />
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {stats.totalDailyDose}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">mg levodopa</div>
      </div>
    </div>
  );
}
