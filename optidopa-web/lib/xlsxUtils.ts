/**
 * XLSX Import/Export utilities for levodopa dose schedule
 */

import * as XLSX from 'xlsx';
import { Dose, MEDICATIONS, PatientProfile, MOTOR_STATE_DESCRIPTIONS } from './pharmacokinetics';
import { format, parse, isValid } from 'date-fns';

export interface ImportResult {
  doses: Dose[];
  errors: string[];
  warnings: string[];
}

/**
 * Export doses to XLSX file
 */
export function exportDosesToXLSX(doses: Dose[], filename?: string): void {
  // Sort doses by datetime
  const sortedDoses = [...doses].sort((a, b) => a.datetime.getTime() - b.datetime.getTime());

  // Prepare data for export
  const data = sortedDoses.map(dose => ({
    'Date': format(dose.datetime, 'yyyy-MM-dd'),
    'Time': format(dose.datetime, 'HH:mm'),
    'Medication': dose.medication,
    'Dose': dose.doseAmount,
    'Amount (mg)': dose.doseMg,
    'Type': dose.formulation,
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, // Date
    { wch: 8 },  // Time
    { wch: 15 }, // Medication
    { wch: 8 },  // Dose
    { wch: 12 }, // Amount (mg)
    { wch: 8 },  // Type
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Levodopa Doses');

  // Generate filename
  const exportFilename = filename || `levodopa_doses_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

  // Trigger download
  XLSX.writeFile(wb, exportFilename);
}

/**
 * Parse Excel date serial number to JavaScript Date
 */
function parseExcelDate(serial: number): Date {
  // Excel date serial starts from 1900-01-01 (with day 1 being 1900-01-01)
  // JavaScript Date counts from 1970-01-01
  const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
  const millisPerDay = 24 * 60 * 60 * 1000;
  return new Date(excelEpoch.getTime() + serial * millisPerDay);
}

/**
 * Parse time string (HH:MM) or Excel time decimal (0.5 = 12:00)
 */
function parseTime(timeValue: any): { hours: number; minutes: number } | null {
  if (typeof timeValue === 'string') {
    // Try to parse HH:MM format
    const match = timeValue.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        return { hours, minutes };
      }
    }
  } else if (typeof timeValue === 'number') {
    // Excel time is a decimal (0.5 = 12:00 PM)
    const totalMinutes = Math.round(timeValue * 24 * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  }
  return null;
}

/**
 * Validate and transform a single imported row into a Dose object
 */
function validateImportedDose(row: any, rowIndex: number): { dose: Dose | null; error: string | null } {
  const errors: string[] = [];

  // Parse date
  let date: Date | null = null;
  if (row['Date']) {
    if (typeof row['Date'] === 'number') {
      // Excel date serial
      date = parseExcelDate(row['Date']);
    } else if (typeof row['Date'] === 'string') {
      // Try parsing common date formats
      const parsedDate = parse(row['Date'], 'yyyy-MM-dd', new Date());
      if (isValid(parsedDate)) {
        date = parsedDate;
      } else {
        // Try other formats
        const altDate = new Date(row['Date']);
        if (isValid(altDate)) {
          date = altDate;
        }
      }
    }
  }

  if (!date || !isValid(date)) {
    errors.push(`Row ${rowIndex + 2}: Invalid or missing date`);
  }

  // Parse time
  const timeResult = parseTime(row['Time']);
  if (!timeResult) {
    errors.push(`Row ${rowIndex + 2}: Invalid or missing time (use HH:MM format)`);
  }

  // Validate medication
  const medication = row['Medication']?.toString().trim();
  if (medication !== 'Carbilev' && medication !== 'Sinemet CR') {
    errors.push(`Row ${rowIndex + 2}: Invalid medication "${medication}" (must be "Carbilev" or "Sinemet CR")`);
  }

  // Validate dose amount
  const doseAmount = row['Dose']?.toString().trim();
  const normalizedDose = doseAmount?.toLowerCase();
  if (normalizedDose !== 'full' && normalizedDose !== 'half') {
    errors.push(`Row ${rowIndex + 2}: Invalid dose "${doseAmount}" (must be "Full" or "Half")`);
  }

  // If any errors, return null
  if (errors.length > 0 || !date || !timeResult || !medication || !normalizedDose) {
    return { dose: null, error: errors.join('; ') };
  }

  // Create datetime
  const datetime = new Date(date);
  datetime.setHours(timeResult.hours, timeResult.minutes, 0, 0);

  // Determine dose values
  const doseAmountFinal = normalizedDose === 'full' ? 'Full' : 'Half';
  const medKey = medication as 'Carbilev' | 'Sinemet CR';
  const doseMg = MEDICATIONS[medKey][normalizedDose as 'full' | 'half'];
  const formulation = MEDICATIONS[medKey].type;

  const dose: Dose = {
    id: `${Date.now()}_${rowIndex}_${Math.random()}`, // Unique ID
    datetime,
    medication: medKey,
    doseAmount: doseAmountFinal as 'Full' | 'Half',
    doseMg,
    formulation,
  };

  return { dose, error: null };
}

/**
 * Import doses from XLSX file
 */
export async function importDosesFromXLSX(file: File): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          return reject(new Error('Failed to read file'));
        }

        // Parse workbook
        const workbook = XLSX.read(data, { type: 'binary', cellDates: false });

        // Get first worksheet
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          return reject(new Error('No sheets found in file'));
        }

        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          return resolve({
            doses: [],
            errors: ['No data found in file'],
            warnings: [],
          });
        }

        // Validate and transform each row
        const doses: Dose[] = [];
        const errors: string[] = [];
        const warnings: string[] = [];

        jsonData.forEach((row, index) => {
          const result = validateImportedDose(row, index);
          if (result.dose) {
            doses.push(result.dose);
          } else if (result.error) {
            errors.push(result.error);
          }
        });

        // Add warning if some rows were skipped
        if (doses.length < jsonData.length) {
          warnings.push(`${jsonData.length - doses.length} row(s) skipped due to validation errors`);
        }

        resolve({ doses, errors, warnings });
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Convert doses to TSV format for clipboard (copy functionality)
 */
export function dosesToTSV(doses: Dose[]): string {
  const sortedDoses = [...doses].sort((a, b) => a.datetime.getTime() - b.datetime.getTime());

  const header = 'Date\tTime\tMedication\tDose\tAmount (mg)\tType';
  const rows = sortedDoses.map(dose =>
    `${format(dose.datetime, 'yyyy-MM-dd')}\t${format(dose.datetime, 'HH:mm')}\t${dose.medication}\t${dose.doseAmount}\t${dose.doseMg}\t${dose.formulation}`
  );

  return [header, ...rows].join('\n');
}

/**
 * Parse TSV data from clipboard (paste functionality)
 */
export function parseTSVToDoses(tsvData: string): ImportResult {
  const lines = tsvData.split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    return { doses: [], errors: ['No data to paste'], warnings: [] };
  }

  // Check if first line is header (optional)
  const firstLine = lines[0].toLowerCase();
  const hasHeader = firstLine.includes('date') || firstLine.includes('time') || firstLine.includes('medication');

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const doses: Dose[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  dataLines.forEach((line, index) => {
    const columns = line.split('\t');

    if (columns.length < 4) {
      errors.push(`Row ${index + 1}: Not enough columns (need at least Date, Time, Medication, Dose)`);
      return;
    }

    const row = {
      'Date': columns[0],
      'Time': columns[1],
      'Medication': columns[2],
      'Dose': columns[3],
    };

    const result = validateImportedDose(row, index);
    if (result.dose) {
      doses.push(result.dose);
    } else if (result.error) {
      errors.push(result.error);
    }
  });

  if (doses.length < dataLines.length) {
    warnings.push(`${dataLines.length - doses.length} row(s) skipped due to validation errors`);
  }

  return { doses, errors, warnings };
}

/**
 * Export patient profile to XLSX file
 * Includes therapeutic ranges, symptom assessments, and clinical notes
 */
export function exportPatientProfileToXLSX(profile: PatientProfile, filename?: string): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Therapeutic Ranges
  const rangesData = [
    ['Therapeutic Ranges', ''],
    ['', ''],
    ['Parameter', 'Value (ng/mL)'],
    ['Minimum Effective Concentration', profile.observedMinEffective ?? 'Not set'],
    ['Optimal Range - Lower Bound', profile.observedOptimalRange?.min ?? 'Not set'],
    ['Optimal Range - Upper Bound', profile.observedOptimalRange?.max ?? 'Not set'],
    ['Dyskinesia Threshold', profile.observedDyskinesiaThreshold ?? 'Not set'],
  ];

  const wsRanges = XLSX.utils.aoa_to_sheet(rangesData);
  wsRanges['!cols'] = [{ wch: 35 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsRanges, 'Therapeutic Ranges');

  // Sheet 2: Symptom Assessment
  const wearingOffData = [
    ['Wearing-Off Symptoms Assessment', ''],
    ['Using UPDRS-III Severity Scale (0-4)', ''],
    ['0 = None, 1 = Minimal, 2 = Mild, 3 = Moderate, 4 = Severe', ''],
    ['', ''],
    ['Motor Wearing-Off Symptoms', 'Severity'],
    ['Tremor Returns', profile.wearingOffSymptoms?.tremorReturns ?? 0],
    ['Slowness Returns (Bradykinesia)', profile.wearingOffSymptoms?.slownessReturns ?? 0],
    ['Stiffness/Rigidity', profile.wearingOffSymptoms?.stiffnessRigidity ?? 0],
    ['Difficulty Getting Up from Chair', profile.wearingOffSymptoms?.difficultyGettingUp ?? 0],
    ['Smaller Handwriting', profile.wearingOffSymptoms?.smallerHandwriting ?? 0],
    ['Shuffling/Freezing of Gait', profile.wearingOffSymptoms?.shufflingFreezing ?? 0],
    ['', ''],
    ['Non-Motor Symptoms', 'Severity'],
    ['Anxiety/Panic', profile.nonMotorSymptoms?.anxietyPanic ?? 0],
    ['Fatigue/Low Energy', profile.nonMotorSymptoms?.fatigueLowEnergy ?? 0],
    ['Pain/Aching', profile.nonMotorSymptoms?.painAching ?? 0],
    ['Sweating', profile.nonMotorSymptoms?.sweating ?? 0],
    ['Mood Changes', profile.nonMotorSymptoms?.moodChanges ?? 0],
    ['', ''],
    ['Dyskinesia Indicators', 'Severity'],
    ['Involuntary Movements', profile.dyskinesiaSymptoms?.involuntaryMovements ?? 0],
    ['Restlessness', profile.dyskinesiaSymptoms?.restlessness ?? 0],
    ['Feeling Jittery', profile.dyskinesiaSymptoms?.feelingJittery ?? 0],
    ['Head Bobbing', profile.dyskinesiaSymptoms?.headBobbing ?? 0],
    ['Trunk Swaying', profile.dyskinesiaSymptoms?.trunkSwaying ?? 0],
  ];

  // Calculate WOQ-9 score
  const wOQ9Score = [
    profile.wearingOffSymptoms?.tremorReturns,
    profile.wearingOffSymptoms?.slownessReturns,
    profile.wearingOffSymptoms?.stiffnessRigidity,
    profile.wearingOffSymptoms?.difficultyGettingUp,
    profile.wearingOffSymptoms?.smallerHandwriting,
    profile.wearingOffSymptoms?.shufflingFreezing,
    profile.nonMotorSymptoms?.anxietyPanic,
    profile.nonMotorSymptoms?.fatigueLowEnergy,
    profile.nonMotorSymptoms?.moodChanges,
  ].filter(s => (s ?? 0) >= 1).length;

  wearingOffData.push(['', '']);
  wearingOffData.push(['WOQ-9 Score', wOQ9Score + '/9']);
  wearingOffData.push(['Interpretation', wOQ9Score >= 3 ? 'Wearing-off strongly suggested' : wOQ9Score >= 2 ? 'Wearing-off likely present' : 'No significant wearing-off detected']);

  const wsSymptoms = XLSX.utils.aoa_to_sheet(wearingOffData);
  wsSymptoms['!cols'] = [{ wch: 40 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsSymptoms, 'Symptom Assessment');

  // Sheet 3: Timing & Patterns
  const timingData = [
    ['Dose Response Timing', ''],
    ['', ''],
    ['Parameter', 'Hours'],
    ['Time Until Best Response', profile.symptomTiming?.hoursUntilBestResponse ?? 'Not recorded'],
    ['Time Until Symptoms Return', profile.symptomTiming?.hoursUntilSymptomsReturn ?? 'Not recorded'],
    ['Duration of Good Time', profile.symptomTiming?.durationOfGoodTime ?? 'Not recorded'],
    ['', ''],
    ['Current Motor State', profile.currentMotorState ?? 'Not recorded'],
    ['State Description', profile.currentMotorState ? MOTOR_STATE_DESCRIPTIONS[profile.currentMotorState] : ''],
    ['', ''],
    ['Last Assessment Date', profile.lastAssessmentDate ? format(profile.lastAssessmentDate, 'yyyy-MM-dd HH:mm') : 'Not recorded'],
  ];

  const wsTiming = XLSX.utils.aoa_to_sheet(timingData);
  wsTiming['!cols'] = [{ wch: 30 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsTiming, 'Timing & Patterns');

  // Sheet 4: Clinical Notes
  const notesData = [
    ['Clinical Notes', ''],
    ['', ''],
    [profile.notes || 'No notes recorded'],
  ];

  const wsNotes = XLSX.utils.aoa_to_sheet(notesData);
  wsNotes['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsNotes, 'Notes');

  // Generate filename
  const exportFilename = filename || `patient_profile_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

  // Trigger download
  XLSX.writeFile(wb, exportFilename);
}
