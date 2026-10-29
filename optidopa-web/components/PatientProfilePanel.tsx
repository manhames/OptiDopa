'use client';

import {
  PatientProfile,
  CONCENTRATION_GUIDE,
  SymptomSeverity,
  MOTOR_STATE_DESCRIPTIONS,
  MotorState
} from '@/lib/pharmacokinetics';
import { Info, Edit2, Save, X, AlertCircle, AlertTriangle, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import SymptomSeverityScale from './SymptomSeverityScale';
import { exportPatientProfileToXLSX } from '@/lib/xlsxUtils';

interface PatientProfilePanelProps {
  profile: PatientProfile;
  onUpdate: (profile: PatientProfile) => void;
}

type TabType = 'ranges' | 'symptoms' | 'timing' | 'notes';

export default function PatientProfilePanel({ profile, onUpdate }: PatientProfilePanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('ranges');
  const [localProfile, setLocalProfile] = useState<PatientProfile>(profile);

  // Sync local profile with prop changes when not editing
  useEffect(() => {
    if (!isEditing) {
      setLocalProfile(profile);
    }
  }, [profile, isEditing]);

  const handleSave = () => {
    onUpdate(localProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalProfile(profile);
    setIsEditing(false);
  };

  const handleExport = () => {
    exportPatientProfileToXLSX(profile);
  };

  const isCustomized = profile.observedOptimalRange ||
                       profile.observedDyskinesiaThreshold ||
                       profile.observedMinEffective;

  // Calculate WOQ-9 score (count symptoms with severity >= 1)
  const calculateWOQ9Score = (): number => {
    const symptoms = [
      localProfile.wearingOffSymptoms?.tremorReturns,
      localProfile.wearingOffSymptoms?.slownessReturns,
      localProfile.wearingOffSymptoms?.stiffnessRigidity,
      localProfile.wearingOffSymptoms?.difficultyGettingUp,
      localProfile.wearingOffSymptoms?.smallerHandwriting,
      localProfile.wearingOffSymptoms?.shufflingFreezing,
      localProfile.nonMotorSymptoms?.anxietyPanic,
      localProfile.nonMotorSymptoms?.fatigueLowEnergy,
      localProfile.nonMotorSymptoms?.moodChanges,
    ];
    return symptoms.filter(s => (s ?? 0) >= 1).length;
  };

  // Calculate dyskinesia score
  const calculateDyskinesiaScore = (): number => {
    const symptoms = [
      localProfile.dyskinesiaSymptoms?.involuntaryMovements,
      localProfile.dyskinesiaSymptoms?.restlessness,
      localProfile.dyskinesiaSymptoms?.feelingJittery,
      localProfile.dyskinesiaSymptoms?.headBobbing,
      localProfile.dyskinesiaSymptoms?.trunkSwaying,
    ];
    return symptoms.filter(s => (s ?? 0) >= 1).length;
  };

  const wOQ9Score = calculateWOQ9Score();
  const dyskinesiaScore = calculateDyskinesiaScore();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Patient Profile
          </h2>
          {isCustomized && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
              Personalized
            </span>
          )}
          {wOQ9Score >= 2 && (
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
              WOQ-9: {wOQ9Score}/9
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <Info size={16} />
            {showGuide ? 'Hide' : 'Show'} Guide
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
            title="Export patient profile to Excel file"
          >
            <Download size={16} />
            Export
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
            >
              <Edit2 size={16} />
              Customize
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <Save size={16} />
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Symptom Guide */}
      {showGuide && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
            Clinical Symptom Guide by Concentration Level
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
            Use this guide to help identify your personal therapeutic range based on observed symptoms:
          </p>
          <div className="space-y-3">
            {CONCENTRATION_GUIDE.map((level, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{level.range}</h4>
                  <span className="text-sm font-mono text-blue-700 dark:text-blue-300">{level.concentration}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  <strong>Symptoms:</strong> {level.symptoms}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Clinical State:</strong> {level.clinicalState}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessment Alerts */}
      {(wOQ9Score >= 2 || dyskinesiaScore >= 2) && (
        <div className="mb-4 space-y-2">
          {wOQ9Score >= 2 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" size={18} />
              <div>
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                  WOQ-9 Score: {wOQ9Score}/9 - Wearing-off {wOQ9Score >= 3 ? 'strongly' : 'likely'} present
                </p>
                <p className="text-xs text-yellow-800 dark:text-yellow-300 mt-1">
                  Consider discussing dose timing adjustment with your healthcare provider
                </p>
              </div>
            </div>
          )}
          {dyskinesiaScore >= 2 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" size={18} />
              <div>
                <p className="text-sm font-semibold text-orange-900 dark:text-orange-200">
                  Dyskinesia Score: {dyskinesiaScore}/5 - May need dose reduction
                </p>
                <p className="text-xs text-orange-800 dark:text-orange-300 mt-1">
                  Discuss with your doctor about lowering doses or adjusting timing
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
        <div className="flex gap-1">
          {[
            { id: 'ranges' as const, label: 'Therapeutic Ranges' },
            { id: 'symptoms' as const, label: 'Symptom Assessment' },
            { id: 'timing' as const, label: 'Timing & Patterns' },
            { id: 'notes' as const, label: 'Clinical Notes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Therapeutic Ranges Tab */}
        {activeTab === 'ranges' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Optimal Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Personal Optimal Range (ng/mL)
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                The concentration range where you feel best (normal movement, no dyskinesia)
              </p>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min (e.g., 900)"
                  disabled={!isEditing}
                  value={localProfile.observedOptimalRange?.min ?? ''}
                  onChange={(e) => setLocalProfile({
                    ...localProfile,
                    observedOptimalRange: {
                      min: Number(e.target.value),
                      max: localProfile.observedOptimalRange?.max ?? 1600
                    }
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max (e.g., 1400)"
                  disabled={!isEditing}
                  value={localProfile.observedOptimalRange?.max ?? ''}
                  onChange={(e) => setLocalProfile({
                    ...localProfile,
                    observedOptimalRange: {
                      min: localProfile.observedOptimalRange?.min ?? 1000,
                      max: Number(e.target.value)
                    }
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                />
              </div>
              {!isCustomized && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Currently using population average: 1000-1600 ng/mL
                </p>
              )}
            </div>

            {/* Dyskinesia Threshold */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Dyskinesia Threshold (ng/mL)
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                The concentration where involuntary movements begin
              </p>
              <input
                type="number"
                placeholder="e.g., 1500"
                disabled={!isEditing}
                value={localProfile.observedDyskinesiaThreshold ?? ''}
                onChange={(e) => setLocalProfile({
                  ...localProfile,
                  observedDyskinesiaThreshold: Number(e.target.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
              />
              {!profile.observedDyskinesiaThreshold && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Currently using population average: 1600 ng/mL
                </p>
              )}
            </div>

            {/* Minimum Effective */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Minimum Effective Concentration (ng/mL)
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                The lowest concentration where symptoms are adequately controlled
              </p>
              <input
                type="number"
                placeholder="e.g., 750"
                disabled={!isEditing}
                value={localProfile.observedMinEffective ?? ''}
                onChange={(e) => setLocalProfile({
                  ...localProfile,
                  observedMinEffective: Number(e.target.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
              />
              {!profile.observedMinEffective && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Currently using population average: 800 ng/mL
                </p>
              )}
            </div>
          </div>
        )}

        {/* Symptom Assessment Tab */}
        {activeTab === 'symptoms' && (
          <div className="space-y-6">
            {/* Motor Wearing-Off Symptoms */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Motor Wearing-Off Symptoms (WOQ-9)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Rate how severe these symptoms are when medication wears off (0-4 scale)
              </p>
              <div className="space-y-0">
                <SymptomSeverityScale
                  symptomName="Tremor Returns"
                  description="Shaking returns before next dose"
                  value={localProfile.wearingOffSymptoms?.tremorReturns ?? 0}
                  onChange={(val) => setLocalProfile({
                    ...localProfile,
                    wearingOffSymptoms: {
                      ...localProfile.wearingOffSymptoms,
                      tremorReturns: val,
                      slownessReturns: localProfile.wearingOffSymptoms?.slownessReturns ?? 0,
                      stiffnessRigidity: localProfile.wearingOffSymptoms?.stiffnessRigidity ?? 0,
                      difficultyGettingUp: localProfile.wearingOffSymptoms?.difficultyGettingUp ?? 0,
                      smallerHandwriting: localProfile.wearingOffSymptoms?.smallerHandwriting ?? 0,
                      shufflingFreezing: localProfile.wearingOffSymptoms?.shufflingFreezing ?? 0,
                    }
                  })}
                  disabled={!isEditing}
                />
                <SymptomSeverityScale
                  symptomName="Slowness Returns"
                  description="Movement becomes slow (bradykinesia)"
                  value={localProfile.wearingOffSymptoms?.slownessReturns ?? 0}
                  onChange={(val) => setLocalProfile({
                    ...localProfile,
                    wearingOffSymptoms: {
                      ...localProfile.wearingOffSymptoms!,
                      slownessReturns: val,
                    }
                  })}
                  disabled={!isEditing}
                />
                <SymptomSeverityScale
                  symptomName="Stiffness/Rigidity"
                  description="Muscles feel stiff and rigid"
                  value={localProfile.wearingOffSymptoms?.stiffnessRigidity ?? 0}
                  onChange={(val) => setLocalProfile({
                    ...localProfile,
                    wearingOffSymptoms: {
                      ...localProfile.wearingOffSymptoms!,
                      stiffnessRigidity: val,
                    }
                  })}
                  disabled={!isEditing}
                />
                <SymptomSeverityScale
                  symptomName="Difficulty Getting Up"
                  description="Hard to get out of chair or bed"
                  value={localProfile.wearingOffSymptoms?.difficultyGettingUp ?? 0}
                  onChange={(val) => setLocalProfile({
                    ...localProfile,
                    wearingOffSymptoms: {
                      ...localProfile.wearingOffSymptoms!,
                      difficultyGettingUp: val,
                    }
                  })}
                  disabled={!isEditing}
                />
                <SymptomSeverityScale
                  symptomName="Smaller Handwriting"
                  description="Writing becomes smaller (micrographia)"
                  value={localProfile.wearingOffSymptoms?.smallerHandwriting ?? 0}
                  onChange={(val) => setLocalProfile({
                    ...localProfile,
                    wearingOffSymptoms: {
                      ...localProfile.wearingOffSymptoms!,
                      smallerHandwriting: val,
                    }
                  })}
                  disabled={!isEditing}
                />
                <SymptomSeverityScale
                  symptomName="Shuffling/Freezing"
                  description="Feet shuffle or freeze when walking"
                  value={localProfile.wearingOffSymptoms?.shufflingFreezing ?? 0}
                  onChange={(val) => setLocalProfile({
                    ...localProfile,
                    wearingOffSymptoms: {
                      ...localProfile.wearingOffSymptoms!,
                      shufflingFreezing: val,
                    }
                  })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Non-Motor Symptoms */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Non-Motor Symptoms
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Often missed but important indicators of wearing-off
              </p>
              <div className="space-y-0">
                <SymptomSeverityScale
                  symptomName="Anxiety/Panic"
                  description="Feeling anxious or panicky before next dose"
                  value={localProfile.nonMotorSymptoms?.anxietyPanic ?? 0}
                  onChange={(val) => setLocalProfile({
                    ...localProfile,
                    nonMotorSymptoms: {
                      ...localProfile.nonMotorSymptoms,
                      anxietyPanic: val,
                      fatigueLowEnergy: localProfile.nonMotorSymptoms?.fatigueLowEnergy ?? 0,
                      painAching: localProfile.nonMotorSymptoms?.painAching ?? 0,
                      sweating: localProfile.nonMotorSymptoms?.sweating ?? 0,
                      moodChanges: localProfile.nonMotorSymptoms?.moodChanges ?? 0,
                    }
                  })}
                  disabled={!isEditing}
                />
                <SymptomSeverityScale
                  symptomName="Fatigue/Low Energy"
                  description="Feeling tired or lack of energy"
                  value={localProfile.nonMotorSymptoms?.fatigueLowEnergy ?? 0}
                  onChange={(val) => setLocalProfile({
                    ...localProfile,
                    nonMotorSymptoms: {
                      ...localProfile.nonMotorSymptoms!,
                      fatigueLowEnergy: val,
                    }
                  })}
                  disabled={!isEditing}
                />
                <SymptomSeverityScale
                  symptomName="Pain/Aching"
                  description="Pain or aching in muscles or joints"
                  value={localProfile.nonMotorSymptoms?.painAching ?? 0}
                  onChange={(val) => setLocalProfile({
                    ...localProfile,
                    nonMotorSymptoms: {
                      ...localProfile.nonMotorSymptoms!,
                      painAching: val,
                    }
                  })}
                  disabled={!isEditing}
                />
                <SymptomSeverityScale
                  symptomName="Sweating"
                  description="Excessive sweating"
                  value={localProfile.nonMotorSymptoms?.sweating ?? 0}
                  onChange={(val) => setLocalProfile({
                    ...localProfile,
                    nonMotorSymptoms: {
                      ...localProfile.nonMotorSymptoms!,
                      sweating: val,
                    }
                  })}
                  disabled={!isEditing}
                />
                <SymptomSeverityScale
                  symptomName="Mood Changes"
                  description="Depression, irritability, or mood swings"
                  value={localProfile.nonMotorSymptoms?.moodChanges ?? 0}
                  onChange={(val) => setLocalProfile({
                    ...localProfile,
                    nonMotorSymptoms: {
                      ...localProfile.nonMotorSymptoms!,
                      moodChanges: val,
                    }
                  })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Dyskinesia Indicators */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Dyskinesia Indicators
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Signs that concentration is too high
              </p>
              <div className="space-y-0">
                <SymptomSeverityScale
                  symptomName="Involuntary Movements"
                  description="Writhing or dancing movements (chorea)"
                  value={localProfile.dyskinesiaSymptoms?.involuntaryMovements ?? 0}
                  onChange={(val) => setLocalProfile({
                    ...localProfile,
                    dyskinesiaSymptoms: {
                      ...localProfile.dyskinesiaSymptoms,
                      involuntaryMovements: val,
                      restlessness: localProfile.dyskinesiaSymptoms?.restlessness ?? 0,
                      feelingJittery: localProfile.dyskinesiaSymptoms?.feelingJittery ?? 0,
                      headBobbing: localProfile.dyskinesiaSymptoms?.headBobbing ?? 0,
                      trunkSwaying: localProfile.dyskinesiaSymptoms?.trunkSwaying ?? 0,
                    }
                  })}
                  disabled={!isEditing}
                />
                <SymptomSeverityScale
                  symptomName="Restlessness"
                  description="Can't sit still, constant movement"
                  value={localProfile.dyskinesiaSymptoms?.restlessness ?? 0}
                  onChange={(val) => setLocalProfile({
                    ...localProfile,
                    dyskinesiaSymptoms: {
                      ...localProfile.dyskinesiaSymptoms!,
                      restlessness: val,
                    }
                  })}
                  disabled={!isEditing}
                />
                <SymptomSeverityScale
                  symptomName="Feeling Jittery"
                  description="Feeling 'too much' or overstimulated"
                  value={localProfile.dyskinesiaSymptoms?.feelingJittery ?? 0}
                  onChange={(val) => setLocalProfile({
                    ...localProfile,
                    dyskinesiaSymptoms: {
                      ...localProfile.dyskinesiaSymptoms!,
                      feelingJittery: val,
                    }
                  })}
                  disabled={!isEditing}
                />
                <SymptomSeverityScale
                  symptomName="Head Bobbing"
                  description="Head moves involuntarily"
                  value={localProfile.dyskinesiaSymptoms?.headBobbing ?? 0}
                  onChange={(val) => setLocalProfile({
                    ...localProfile,
                    dyskinesiaSymptoms: {
                      ...localProfile.dyskinesiaSymptoms!,
                      headBobbing: val,
                    }
                  })}
                  disabled={!isEditing}
                />
                <SymptomSeverityScale
                  symptomName="Trunk Swaying"
                  description="Body/trunk sways or rocks"
                  value={localProfile.dyskinesiaSymptoms?.trunkSwaying ?? 0}
                  onChange={(val) => setLocalProfile({
                    ...localProfile,
                    dyskinesiaSymptoms: {
                      ...localProfile.dyskinesiaSymptoms!,
                      trunkSwaying: val,
                    }
                  })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>About WOQ-9:</strong> The Wearing-Off Questionnaire (WOQ-9) is a validated clinical tool.
                A score ≥2 suggests wearing-off is present. A score ≥3 strongly indicates wearing-off.
                Share these results with your healthcare provider.
              </p>
            </div>
          </div>
        )}

        {/* Timing & Patterns Tab */}
        {activeTab === 'timing' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  How many hours after taking a dose do you feel best?
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    disabled={!isEditing}
                    value={localProfile.symptomTiming?.hoursUntilBestResponse ?? 1}
                    onChange={(e) => setLocalProfile({
                      ...localProfile,
                      symptomTiming: {
                        ...localProfile.symptomTiming,
                        hoursUntilBestResponse: Number(e.target.value),
                        hoursUntilSymptomsReturn: localProfile.symptomTiming?.hoursUntilSymptomsReturn ?? 3,
                        durationOfGoodTime: localProfile.symptomTiming?.durationOfGoodTime ?? 2,
                      }
                    })}
                    className="flex-1"
                  />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[80px]">
                    {localProfile.symptomTiming?.hoursUntilBestResponse ?? 1} hours
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  How many hours after a dose do symptoms start returning?
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="0.5"
                    disabled={!isEditing}
                    value={localProfile.symptomTiming?.hoursUntilSymptomsReturn ?? 3}
                    onChange={(e) => setLocalProfile({
                      ...localProfile,
                      symptomTiming: {
                        ...localProfile.symptomTiming!,
                        hoursUntilSymptomsReturn: Number(e.target.value),
                      }
                    })}
                    className="flex-1"
                  />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[80px]">
                    {localProfile.symptomTiming?.hoursUntilSymptomsReturn ?? 3} hours
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  How long does your &quot;good time&quot; last?
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="0.5"
                    disabled={!isEditing}
                    value={localProfile.symptomTiming?.durationOfGoodTime ?? 2}
                    onChange={(e) => setLocalProfile({
                      ...localProfile,
                      symptomTiming: {
                        ...localProfile.symptomTiming!,
                        durationOfGoodTime: Number(e.target.value),
                      }
                    })}
                    className="flex-1"
                  />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[80px]">
                    {localProfile.symptomTiming?.durationOfGoodTime ?? 2} hours
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Current Motor State
                </label>
                <select
                  disabled={!isEditing}
                  value={localProfile.currentMotorState ?? 'ON'}
                  onChange={(e) => setLocalProfile({
                    ...localProfile,
                    currentMotorState: e.target.value as MotorState
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="ON">ON - Good control</option>
                  <option value="OFF">OFF - Symptoms present</option>
                  <option value="ON_WITH_DYSKINESIA">ON with dyskinesia</option>
                  <option value="OFF_WITH_DYSKINESIA">OFF with dyskinesia</option>
                </select>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {MOTOR_STATE_DESCRIPTIONS[localProfile.currentMotorState ?? 'ON']}
                </p>
              </div>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>Timing Information:</strong> Track when you feel best and when symptoms return to help optimize dose timing.
                The typical levodopa half-life is 1.5 hours, but individual responses vary significantly.
              </p>
            </div>
          </div>
        )}

        {/* Clinical Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Clinical Observations & Notes
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Track patterns, side effects, triggers, or other observations
              </p>
              <textarea
                placeholder="e.g., 'Tremor returns around 3.5 hours after dose', 'Feel jittery above 1400', 'Protein-rich meals delay response', 'Exercise triggers wearing-off earlier'"
                disabled={!isEditing}
                value={localProfile.notes ?? ''}
                onChange={(e) => setLocalProfile({
                  ...localProfile,
                  notes: e.target.value
                })}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {!isEditing && activeTab === 'ranges' && (
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>How to personalize:</strong> Work with your healthcare provider to identify your specific therapeutic ranges
            through careful observation and, optionally, blood level monitoring. Click &quot;Customize&quot; to enter your personal ranges,
            which will be used instead of population averages for calculating statistics.
          </p>
        </div>
      )}

      {!isEditing && activeTab === 'symptoms' && (
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>For self-monitoring only:</strong> These assessments help you recognize and track symptoms but are not for self-diagnosis.
            Always discuss changes with your healthcare provider before adjusting medications.
          </p>
        </div>
      )}
    </div>
  );
}
