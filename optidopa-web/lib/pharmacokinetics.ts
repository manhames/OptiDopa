/**
 * Pharmacokinetic calculations for levodopa
 * Based on clinical literature and one-compartment model
 */

// Symptom severity using UPDRS-III scale (0-4)
export type SymptomSeverity = 0 | 1 | 2 | 3 | 4;

// Motor wearing-off symptoms (from WOQ-9)
export interface WearingOffSymptoms {
  tremorReturns: SymptomSeverity;
  slownessReturns: SymptomSeverity;
  stiffnessRigidity: SymptomSeverity;
  difficultyGettingUp: SymptomSeverity;
  smallerHandwriting: SymptomSeverity;
  shufflingFreezing: SymptomSeverity;
}

// Non-motor wearing-off symptoms
export interface NonMotorSymptoms {
  anxietyPanic: SymptomSeverity;
  fatigueLowEnergy: SymptomSeverity;
  painAching: SymptomSeverity;
  sweating: SymptomSeverity;
  moodChanges: SymptomSeverity;
}

// Dyskinesia indicators
export interface DyskinesiaSymptoms {
  involuntaryMovements: SymptomSeverity;
  restlessness: SymptomSeverity;
  feelingJittery: SymptomSeverity;
  headBobbing: SymptomSeverity;
  trunkSwaying: SymptomSeverity;
}

// Timing information (relative to dose)
export interface SymptomTiming {
  hoursUntilBestResponse: number;     // 0-5 hours slider
  hoursUntilSymptomsReturn: number;   // 0-6 hours slider
  durationOfGoodTime: number;         // 0-6 hours slider
}

// Motor state definitions (standardized clinical terms)
export type MotorState = 'ON' | 'OFF' | 'ON_WITH_DYSKINESIA' | 'OFF_WITH_DYSKINESIA';

export const MOTOR_STATE_DESCRIPTIONS: Record<MotorState, string> = {
  'ON': 'Good symptom control, moving well, independent function',
  'OFF': 'Symptoms return, slow movement, need help with tasks',
  'ON_WITH_DYSKINESIA': 'Moving well but involuntary movements present',
  'OFF_WITH_DYSKINESIA': 'Both poor symptom control AND dyskinesia (diphasic)'
};

export interface PatientProfile {
  // Observed therapeutic ranges (personalized through clinical experience)
  observedOptimalRange?: {
    min: number;  // Patient feels best at this lower bound (ng/mL)
    max: number;  // Patient feels best at this upper bound (ng/mL)
  };
  observedDyskinesiaThreshold?: number;  // Dyskinesia starts appearing (ng/mL)
  observedMinEffective?: number;         // Minimum concentration for symptom control (ng/mL)
  notes?: string;  // Clinical observations

  // Structured symptom tracking
  wearingOffSymptoms?: WearingOffSymptoms;
  nonMotorSymptoms?: NonMotorSymptoms;
  dyskinesiaSymptoms?: DyskinesiaSymptoms;
  symptomTiming?: SymptomTiming;
  currentMotorState?: MotorState;
  lastAssessmentDate?: Date;
}

export interface PKParams {
  Vd: number;           // Volume of distribution (L)
  t_half: number;       // Half-life (hours)
  k_e: number;          // Elimination rate constant (h^-1)
  IR: {
    k_a: number;        // Absorption rate constant (h^-1)
    F: number;          // Bioavailability
    T_max: number;      // Time to peak (hours)
  };
  CR: {
    k_a: number;
    F: number;
    T_max: number;
  };
  C_min: number;              // Minimum effective concentration (ng/mL)
  C_target_low: number;       // Lower bound optimal range (ng/mL)
  C_target_high: number;      // Upper bound optimal range (ng/mL)
  C_dyskinesia: number;       // Dyskinesia threshold (ng/mL)
}

// Clinical symptom descriptions at different concentration levels
export interface ConcentrationLevel {
  range: string;
  concentration: string;
  symptoms: string;
  clinicalState: string;
}

export const CONCENTRATION_GUIDE: ConcentrationLevel[] = [
  {
    range: "Subtherapeutic",
    concentration: "< 400 ng/mL",
    symptoms: "Full Parkinson's symptoms present",
    clinicalState: "Significant tremor, rigidity, bradykinesia (slowness), difficulty initiating movement, shuffling gait, soft voice, masked facial expression"
  },
  {
    range: "Low Therapeutic",
    concentration: "400-800 ng/mL",
    symptoms: "Partial symptom control",
    clinicalState: "Mild tremor may persist, some stiffness, movement easier but not optimal, functional but below target"
  },
  {
    range: "Minimum Effective (Population Average)",
    concentration: "800-1000 ng/mL",
    symptoms: "Adequate symptom control for many patients",
    clinicalState: "Tremor controlled, normal movement speed, good functional ability, may still feel 'not quite right' for some patients"
  },
  {
    range: "Optimal Range (Population Average)",
    concentration: "1000-1600 ng/mL",
    symptoms: "Best symptom control for most patients",
    clinicalState: "Feeling 'normal', smooth movements, no tremor, good dexterity, normal gait and speech, best quality of life"
  },
  {
    range: "High Therapeutic",
    concentration: "1600-2000 ng/mL",
    symptoms: "Risk of dyskinesia begins",
    clinicalState: "Good symptom control BUT may start seeing involuntary movements (chorea), restlessness, may feel 'too much' or jittery"
  },
  {
    range: "Supratherapeutic",
    concentration: "> 2000 ng/mL",
    symptoms: "Dyskinesia likely",
    clinicalState: "Involuntary writhing movements (dyskinesia), excessive movements, may prefer to be 'under-dosed' rather than experience this"
  }
];

export const PK_PARAMS: PKParams = {
  Vd: 90.0,
  t_half: 1.5,
  k_e: Math.log(2) / 1.5,
  IR: {
    k_a: 1.86,
    F: 1.0,
    T_max: 0.8,
  },
  CR: {
    k_a: 0.5,
    F: 0.75,
    T_max: 1.75,
  },
  C_min: 800,
  C_target_low: 1000,
  C_target_high: 1600,
  C_dyskinesia: 1600,
};

export type FormulationType = 'IR' | 'CR';

export interface Dose {
  id: string;
  datetime: Date;
  medication: 'Carbilev' | 'Sinemet CR';
  doseAmount: 'Full' | 'Half';
  doseMg: number;
  formulation: FormulationType;
}

export const MEDICATIONS = {
  'Carbilev': {
    full: 100,
    half: 50,
    type: 'IR' as FormulationType,
  },
  'Sinemet CR': {
    full: 200,
    half: 100,
    type: 'CR' as FormulationType,
  },
};

/**
 * Calculate plasma concentration from a single dose
 * Using one-compartment model with first-order absorption
 */
export function singleDoseConcentration(
  t: number,
  doseMg: number,
  formulation: FormulationType,
  params: PKParams = PK_PARAMS
): number {
  if (t < 0) return 0;

  const { k_a, F } = params[formulation];
  const { k_e, Vd } = params;

  // Convert dose from mg to μg
  const doseUg = doseMg * 1000;

  // One-compartment model: C(t) = (F * Dose * k_a) / (Vd * (k_a - k_e)) * [e^(-k_e*t) - e^(-k_a*t)]
  const factor = (F * doseUg * k_a) / (Vd * (k_a - k_e));
  const concentration = factor * (Math.exp(-k_e * t) - Math.exp(-k_a * t));

  return concentration;
}

/**
 * Calculate total plasma concentration from multiple doses
 */
export function calculateTotalConcentration(
  timeHours: number,
  doses: Dose[],
  startTime: Date,
  params: PKParams = PK_PARAMS
): number {
  let total = 0;

  for (const dose of doses) {
    // Calculate hours since this dose
    const doseTimeHours = (dose.datetime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const timeSinceDose = timeHours - doseTimeHours;

    // Add contribution from this dose
    total += singleDoseConcentration(timeSinceDose, dose.doseMg, dose.formulation, params);
  }

  return total;
}

/**
 * Generate concentration profile over time
 */
export interface ConcentrationPoint {
  time: Date;
  concentration: number;
  hoursFromStart: number;
}

export function generateConcentrationProfile(
  doses: Dose[],
  durationHours?: number,
  pointsPerHour: number = 12
): ConcentrationPoint[] {
  if (doses.length === 0) return [];

  // Find earliest and latest dose times
  const startTime = new Date(Math.min(...doses.map(d => d.datetime.getTime())));
  const endTime = new Date(Math.max(...doses.map(d => d.datetime.getTime())));

  // Calculate duration automatically if not provided
  // Add 6 hours after the last dose to show the complete elimination curve
  const calculatedDuration = durationHours ??
    Math.max(28, ((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)) + 6);

  const points: ConcentrationPoint[] = [];
  const totalPoints = calculatedDuration * pointsPerHour + 1;

  for (let i = 0; i < totalPoints; i++) {
    const hoursFromStart = i / pointsPerHour;
    const time = new Date(startTime.getTime() + hoursFromStart * 60 * 60 * 1000);
    const concentration = calculateTotalConcentration(hoursFromStart, doses, startTime);

    points.push({
      time,
      concentration,
      hoursFromStart,
    });
  }

  return points;
}

/**
 * Calculate statistics for a concentration profile
 */
export interface ConcentrationStats {
  peakConcentration: number;
  troughConcentration: number;
  percentInOptimalRange: number;
  percentAboveMinimum: number;
  percentInDyskinesia: number;
  totalDailyDose: number;
}

export function calculateStats(
  profile: ConcentrationPoint[],
  doses: Dose[],
  params: PKParams = PK_PARAMS,
  patientProfile?: PatientProfile
): ConcentrationStats {
  if (profile.length === 0) {
    return {
      peakConcentration: 0,
      troughConcentration: 0,
      percentInOptimalRange: 0,
      percentAboveMinimum: 0,
      percentInDyskinesia: 0,
      totalDailyDose: 0,
    };
  }

  const concentrations = profile.map(p => p.concentration);
  const peakConcentration = Math.max(...concentrations);
  const troughConcentration = Math.min(...concentrations);

  // Use patient-specific ranges if available, otherwise use population averages
  const optimalLow = patientProfile?.observedOptimalRange?.min ?? params.C_target_low;
  const optimalHigh = patientProfile?.observedOptimalRange?.max ?? params.C_target_high;
  const minEffective = patientProfile?.observedMinEffective ?? params.C_min;
  const dyskinesiaThreshold = patientProfile?.observedDyskinesiaThreshold ?? params.C_dyskinesia;

  const inOptimal = concentrations.filter(
    c => c >= optimalLow && c <= optimalHigh
  ).length;
  const aboveMin = concentrations.filter(c => c >= minEffective).length;
  const inDyskinesia = concentrations.filter(c => c > dyskinesiaThreshold).length;

  const percentInOptimalRange = (inOptimal / concentrations.length) * 100;
  const percentAboveMinimum = (aboveMin / concentrations.length) * 100;
  const percentInDyskinesia = (inDyskinesia / concentrations.length) * 100;

  const totalDailyDose = doses.reduce((sum, dose) => sum + dose.doseMg, 0);

  return {
    peakConcentration,
    troughConcentration,
    percentInOptimalRange,
    percentAboveMinimum,
    percentInDyskinesia,
    totalDailyDose,
  };
}
