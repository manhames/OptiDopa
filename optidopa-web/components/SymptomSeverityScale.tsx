'use client';

import { SymptomSeverity } from '@/lib/pharmacokinetics';

interface SymptomSeverityScaleProps {
  symptomName: string;
  description: string;
  value: SymptomSeverity;
  onChange: (severity: SymptomSeverity) => void;
  disabled?: boolean;
}

const SEVERITY_LEVELS: Array<{
  value: SymptomSeverity;
  label: string;
  color: string;
  description: string;
}> = [
  { value: 0, label: 'None', color: 'bg-gray-200 dark:bg-gray-700 border-gray-300', description: 'Not present' },
  { value: 1, label: 'Minimal', color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300', description: 'Only you notice' },
  { value: 2, label: 'Mild', color: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300', description: 'Others might notice' },
  { value: 3, label: 'Moderate', color: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300', description: 'Affects function' },
  { value: 4, label: 'Severe', color: 'bg-red-100 dark:bg-red-900/30 border-red-300', description: 'Significantly disabling' },
];

export default function SymptomSeverityScale({
  symptomName,
  description,
  value,
  onChange,
  disabled = false,
}: SymptomSeverityScaleProps) {
  return (
    <div className="symptom-severity-scale border-b border-gray-200 dark:border-gray-700 py-4 last:border-b-0">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{symptomName}</h4>
        <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SEVERITY_LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(level.value)}
            className={`
              flex-1 min-w-[80px] px-3 py-2 rounded-lg border-2 transition-all
              ${value === level.value
                ? `${level.color} border-current shadow-sm`
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            `}
            title={level.description}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{level.value}</div>
              <div className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">{level.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Show description of selected severity */}
      {value > 0 && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 ml-1">
          {SEVERITY_LEVELS[value].description}
        </p>
      )}
    </div>
  );
}
