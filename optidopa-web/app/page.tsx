'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Dose, MEDICATIONS, generateConcentrationProfile, calculateStats, PatientProfile } from '@/lib/pharmacokinetics';
import { exportDosesToXLSX, importDosesFromXLSX, ImportResult } from '@/lib/xlsxUtils';
import DoseTable from '@/components/DoseTable';
import ConcentrationChart from '@/components/ConcentrationChart';
import StatsPanel from '@/components/StatsPanel';
import ImportPreviewModal from '@/components/ImportPreviewModal';
import PatientProfilePanel from '@/components/PatientProfilePanel';
import { Plus, Upload, Download } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function Home() {
  const [doses, setDoses] = useState<Dose[]>([
    {
      id: '1',
      datetime: new Date('2025-12-27T07:00:00'),
      medication: 'Carbilev',
      doseAmount: 'Full',
      doseMg: 100,
      formulation: 'IR',
    },
    {
      id: '2',
      datetime: new Date('2025-12-27T11:00:00'),
      medication: 'Carbilev',
      doseAmount: 'Full',
      doseMg: 100,
      formulation: 'IR',
    },
    {
      id: '3',
      datetime: new Date('2025-12-27T15:00:00'),
      medication: 'Carbilev',
      doseAmount: 'Full',
      doseMg: 100,
      formulation: 'IR',
    },
    {
      id: '4',
      datetime: new Date('2025-12-27T19:00:00'),
      medication: 'Carbilev',
      doseAmount: 'Half',
      doseMg: 50,
      formulation: 'IR',
    },
    {
      id: '5',
      datetime: new Date('2025-12-27T23:00:00'),
      medication: 'Sinemet CR',
      doseAmount: 'Full',
      doseMg: 200,
      formulation: 'CR',
    },
  ]);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile>({});

  // Load patient profile from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('patientProfile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Handle Date deserialization
        if (parsed.lastAssessmentDate) {
          parsed.lastAssessmentDate = new Date(parsed.lastAssessmentDate);
        }
        setPatientProfile(parsed);
      } catch (e) {
        console.error('Failed to load patient profile:', e);
      }
    }
  }, []);

  // Save patient profile to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(patientProfile).length > 0) {
      localStorage.setItem('patientProfile', JSON.stringify(patientProfile));
    }
  }, [patientProfile]);

  const addDose = () => {
    // Find the latest dose time, or use current time if no doses exist
    let newDateTime: Date;

    if (doses.length === 0) {
      // No doses exist, use current time
      newDateTime = new Date();
    } else {
      // Find the last dose (latest datetime)
      const sortedByTime = [...doses].sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
      const lastDose = sortedByTime[sortedByTime.length - 1];

      // Add 4 hours to the last dose (typical spacing)
      newDateTime = new Date(lastDose.datetime);
      newDateTime.setHours(newDateTime.getHours() + 4);

      // Round to nearest hour for cleaner times
      newDateTime.setMinutes(0);
      newDateTime.setSeconds(0);
      newDateTime.setMilliseconds(0);
    }

    const newDose: Dose = {
      id: Date.now().toString(),
      datetime: newDateTime,
      medication: 'Carbilev',
      doseAmount: 'Full',
      doseMg: 100,
      formulation: 'IR',
    };
    setDoses([...doses, newDose]);
  };

  const updateDose = (id: string, updates: Partial<Dose>) => {
    setDoses(doses.map(dose => {
      if (dose.id !== id) return dose;

      const updated = { ...dose, ...updates };

      // Update doseMg and formulation based on medication and amount
      if (updates.medication || updates.doseAmount) {
        const med = updated.medication;
        const amount = updated.doseAmount;
        updated.doseMg = MEDICATIONS[med][amount.toLowerCase() as 'full' | 'half'];
        updated.formulation = MEDICATIONS[med].type;
      }

      return updated;
    }));
  };

  const deleteDose = (id: string) => {
    setDoses(doses.filter(dose => dose.id !== id));
  };

  const handleBulkUpdate = (newDoses: Dose[]) => {
    setDoses(newDoses);
  };

  const handleExport = () => {
    exportDosesToXLSX(doses);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importDosesFromXLSX(file);
      setImportResult(result);
      setImportModalOpen(true);
    } catch (error) {
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Reset file input
    e.target.value = '';
  };

  const handleImportConfirm = (importedDoses: Dose[]) => {
    setDoses(importedDoses);
  };

  // Calculate concentration profile (duration calculated automatically from dose span)
  const profile = useMemo(() => generateConcentrationProfile(doses), [doses]);
  const stats = useMemo(() => calculateStats(profile, doses, undefined, patientProfile), [profile, doses, patientProfile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            OptiDopa
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Levodopa Dose Tracker & Plasma Concentration Simulator
          </p>
        </div>

        {/* Data ownership notice (browser-only mode) */}
        {!isSupabaseConfigured() && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-100">
            <p className="font-semibold mb-1">Your data stays on this device.</p>
            <p>
              Nothing you enter is sent to a server. Doses and your profile are saved only in this browser&apos;s
              local storage, so clearing site data or switching devices will lose them. Use{' '}
              <strong>Export</strong> regularly to keep an Excel copy, and <strong>Import</strong> to restore it.
              To sync across devices with your own private database, see the{' '}
              <a
                href="https://github.com/manhames/OptiDopa#keeping-your-data"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                self-hosting guide
              </a>.
            </p>
          </div>
        )}

        {/* Medications Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-blue-500">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Carbilev 25/100mg</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Immediate Release (IR)</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Full: 100mg • Half: 50mg</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-purple-500">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Sinemet CR 50/200mg</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Controlled Release (CR)</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Full: 200mg • Half: 100mg</p>
          </div>
        </div>

        {/* Patient Profile Panel */}
        <PatientProfilePanel
          profile={patientProfile}
          onUpdate={setPatientProfile}
        />

        {/* Stats Panel */}
        <StatsPanel stats={stats} />

        {/* Dose Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Dose Schedule
            </h2>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={handleImportClick}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                title="Import from Excel file"
              >
                <Upload size={18} />
                Import
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                title="Export to Excel file"
              >
                <Download size={18} />
                Export
              </button>
              <button
                onClick={addDose}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <Plus size={18} />
                Add Dose
              </button>
            </div>
          </div>
          <DoseTable
            doses={doses}
            onUpdate={updateDose}
            onDelete={deleteDose}
            onBulkUpdate={handleBulkUpdate}
          />
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Plasma Concentration Profile
          </h2>
          <ConcentrationChart profile={profile} doses={doses} />
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>⚠️ Important Disclaimer:</strong> This model uses population-average pharmacokinetic parameters
            and is for educational purposes only. Individual responses vary significantly. Always consult your
            healthcare provider before making any changes to your medication schedule.
          </p>
        </div>
      </div>

      {/* Import Preview Modal */}
      <ImportPreviewModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        importResult={importResult}
        onConfirm={handleImportConfirm}
      />
    </div>
  );
}
