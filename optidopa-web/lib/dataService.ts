/**
 * Data service layer - handles both localStorage and Supabase
 * Falls back to localStorage if Supabase is not configured
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { Dose, PatientProfile } from './pharmacokinetics';
import type { Database } from './database.types';

type DbDose = Database['public']['Tables']['doses']['Row'];
type DbPatientProfile = Database['public']['Tables']['patient_profile']['Row'];

// ============================================================================
// HELPER FUNCTIONS - Convert between app types and database types
// ============================================================================

function doseToDb(dose: Dose, userId: string): Database['public']['Tables']['doses']['Insert'] {
  return {
    id: dose.id,
    user_id: userId,
    datetime: dose.datetime.toISOString(),
    medication: dose.medication,
    dose_amount: dose.doseAmount,
    dose_mg: dose.doseMg,
    formulation: dose.formulation,
  };
}

function dbToDose(dbDose: DbDose): Dose {
  return {
    id: dbDose.id,
    datetime: new Date(dbDose.datetime),
    medication: dbDose.medication,
    doseAmount: dbDose.dose_amount,
    doseMg: dbDose.dose_mg,
    formulation: dbDose.formulation,
  };
}

function profileToDb(profile: PatientProfile, userId: string): Database['public']['Tables']['patient_profile']['Insert'] {
  return {
    user_id: userId,
    observed_min_effective: profile.observedMinEffective ?? null,
    observed_optimal_range_min: profile.observedOptimalRange?.min ?? null,
    observed_optimal_range_max: profile.observedOptimalRange?.max ?? null,
    observed_dyskinesia_threshold: profile.observedDyskinesiaThreshold ?? null,
    tremor_returns: profile.wearingOffSymptoms?.tremorReturns ?? null,
    slowness_returns: profile.wearingOffSymptoms?.slownessReturns ?? null,
    stiffness_rigidity: profile.wearingOffSymptoms?.stiffnessRigidity ?? null,
    difficulty_getting_up: profile.wearingOffSymptoms?.difficultyGettingUp ?? null,
    smaller_handwriting: profile.wearingOffSymptoms?.smallerHandwriting ?? null,
    shuffling_freezing: profile.wearingOffSymptoms?.shufflingFreezing ?? null,
    anxiety_panic: profile.nonMotorSymptoms?.anxietyPanic ?? null,
    fatigue_low_energy: profile.nonMotorSymptoms?.fatigueLowEnergy ?? null,
    pain_aching: profile.nonMotorSymptoms?.painAching ?? null,
    sweating: profile.nonMotorSymptoms?.sweating ?? null,
    mood_changes: profile.nonMotorSymptoms?.moodChanges ?? null,
    involuntary_movements: profile.dyskinesiaSymptoms?.involuntaryMovements ?? null,
    restlessness: profile.dyskinesiaSymptoms?.restlessness ?? null,
    feeling_jittery: profile.dyskinesiaSymptoms?.feelingJittery ?? null,
    head_bobbing: profile.dyskinesiaSymptoms?.headBobbing ?? null,
    trunk_swaying: profile.dyskinesiaSymptoms?.trunkSwaying ?? null,
    hours_until_best_response: profile.symptomTiming?.hoursUntilBestResponse ?? null,
    hours_until_symptoms_return: profile.symptomTiming?.hoursUntilSymptomsReturn ?? null,
    duration_of_good_time: profile.symptomTiming?.durationOfGoodTime ?? null,
    current_motor_state: profile.currentMotorState ?? null,
    notes: profile.notes ?? null,
    last_assessment_date: profile.lastAssessmentDate?.toISOString() ?? null,
  };
}

function dbToProfile(dbProfile: DbPatientProfile): PatientProfile {
  return {
    observedMinEffective: dbProfile.observed_min_effective ?? undefined,
    observedOptimalRange: dbProfile.observed_optimal_range_min && dbProfile.observed_optimal_range_max
      ? { min: dbProfile.observed_optimal_range_min, max: dbProfile.observed_optimal_range_max }
      : undefined,
    observedDyskinesiaThreshold: dbProfile.observed_dyskinesia_threshold ?? undefined,
    wearingOffSymptoms: {
      tremorReturns: (dbProfile.tremor_returns ?? 0) as 0 | 1 | 2 | 3 | 4,
      slownessReturns: (dbProfile.slowness_returns ?? 0) as 0 | 1 | 2 | 3 | 4,
      stiffnessRigidity: (dbProfile.stiffness_rigidity ?? 0) as 0 | 1 | 2 | 3 | 4,
      difficultyGettingUp: (dbProfile.difficulty_getting_up ?? 0) as 0 | 1 | 2 | 3 | 4,
      smallerHandwriting: (dbProfile.smaller_handwriting ?? 0) as 0 | 1 | 2 | 3 | 4,
      shufflingFreezing: (dbProfile.shuffling_freezing ?? 0) as 0 | 1 | 2 | 3 | 4,
    },
    nonMotorSymptoms: {
      anxietyPanic: (dbProfile.anxiety_panic ?? 0) as 0 | 1 | 2 | 3 | 4,
      fatigueLowEnergy: (dbProfile.fatigue_low_energy ?? 0) as 0 | 1 | 2 | 3 | 4,
      painAching: (dbProfile.pain_aching ?? 0) as 0 | 1 | 2 | 3 | 4,
      sweating: (dbProfile.sweating ?? 0) as 0 | 1 | 2 | 3 | 4,
      moodChanges: (dbProfile.mood_changes ?? 0) as 0 | 1 | 2 | 3 | 4,
    },
    dyskinesiaSymptoms: {
      involuntaryMovements: (dbProfile.involuntary_movements ?? 0) as 0 | 1 | 2 | 3 | 4,
      restlessness: (dbProfile.restlessness ?? 0) as 0 | 1 | 2 | 3 | 4,
      feelingJittery: (dbProfile.feeling_jittery ?? 0) as 0 | 1 | 2 | 3 | 4,
      headBobbing: (dbProfile.head_bobbing ?? 0) as 0 | 1 | 2 | 3 | 4,
      trunkSwaying: (dbProfile.trunk_swaying ?? 0) as 0 | 1 | 2 | 3 | 4,
    },
    symptomTiming: {
      hoursUntilBestResponse: dbProfile.hours_until_best_response ?? 0,
      hoursUntilSymptomsReturn: dbProfile.hours_until_symptoms_return ?? 0,
      durationOfGoodTime: dbProfile.duration_of_good_time ?? 0,
    },
    currentMotorState: dbProfile.current_motor_state ?? undefined,
    notes: dbProfile.notes ?? undefined,
    lastAssessmentDate: dbProfile.last_assessment_date ? new Date(dbProfile.last_assessment_date) : undefined,
  };
}

// ============================================================================
// DOSES SERVICE
// ============================================================================

export async function getDoses(): Promise<Dose[]> {
  if (!isSupabaseConfigured() || !supabase) {
    // Fallback to localStorage
    const saved = localStorage.getItem('doses');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((d: any) => ({ ...d, datetime: new Date(d.datetime) }));
    } catch {
      return [];
    }
  }

  // Get from Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('doses')
    .select('*')
    .eq('user_id', user.id)
    .order('datetime', { ascending: true });

  if (error) {
    console.error('Error fetching doses:', error);
    return [];
  }

  return data.map(dbToDose);
}

export async function saveDoses(doses: Dose[]): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    // Fallback to localStorage
    localStorage.setItem('doses', JSON.stringify(doses));
    return;
  }

  // Save to Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user logged in');
    return;
  }

  // Delete all existing doses for this user
  await supabase.from('doses').delete().eq('user_id', user.id);

  // Insert new doses
  if (doses.length > 0) {
    const dbDoses = doses.map(dose => doseToDb(dose, user.id));
    const { error } = await supabase.from('doses').insert(dbDoses);
    if (error) {
      console.error('Error saving doses:', error);
    }
  }
}

export async function addDose(dose: Dose): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    // Fallback to localStorage
    const doses = await getDoses();
    doses.push(dose);
    localStorage.setItem('doses', JSON.stringify(doses));
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('doses').insert(doseToDb(dose, user.id));
  if (error) {
    console.error('Error adding dose:', error);
  }
}

export async function updateDose(id: string, updates: Partial<Dose>): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    // Fallback to localStorage
    const doses = await getDoses();
    const index = doses.findIndex(d => d.id === id);
    if (index >= 0) {
      doses[index] = { ...doses[index], ...updates };
      localStorage.setItem('doses', JSON.stringify(doses));
    }
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const updateData: any = {};
  if (updates.datetime) updateData.datetime = updates.datetime.toISOString();
  if (updates.medication) updateData.medication = updates.medication;
  if (updates.doseAmount) updateData.dose_amount = updates.doseAmount;
  if (updates.doseMg !== undefined) updateData.dose_mg = updates.doseMg;
  if (updates.formulation) updateData.formulation = updates.formulation;

  const { error } = await supabase
    .from('doses')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating dose:', error);
  }
}

export async function deleteDose(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    // Fallback to localStorage
    const doses = await getDoses();
    const filtered = doses.filter(d => d.id !== id);
    localStorage.setItem('doses', JSON.stringify(filtered));
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('doses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting dose:', error);
  }
}

// ============================================================================
// PATIENT PROFILE SERVICE
// ============================================================================

export async function getPatientProfile(): Promise<PatientProfile> {
  if (!isSupabaseConfigured() || !supabase) {
    // Fallback to localStorage
    const saved = localStorage.getItem('patientProfile');
    if (!saved) return {};
    try {
      const parsed = JSON.parse(saved);
      if (parsed.lastAssessmentDate) {
        parsed.lastAssessmentDate = new Date(parsed.lastAssessmentDate);
      }
      return parsed;
    } catch {
      return {};
    }
  }

  // Get from Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from('patient_profile')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No profile exists yet
      return {};
    }
    console.error('Error fetching patient profile:', error);
    return {};
  }

  return dbToProfile(data);
}

export async function savePatientProfile(profile: PatientProfile): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    // Fallback to localStorage
    localStorage.setItem('patientProfile', JSON.stringify(profile));
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const dbProfile = profileToDb(profile, user.id);

  // Try to update first
  const { error: updateError } = await supabase
    .from('patient_profile')
    .update(dbProfile)
    .eq('user_id', user.id);

  if (updateError) {
    // If update fails, try insert (profile doesn't exist yet)
    const { error: insertError } = await supabase
      .from('patient_profile')
      .insert(dbProfile);

    if (insertError) {
      console.error('Error saving patient profile:', insertError);
    }
  }
}

// ============================================================================
// MIGRATION - Copy localStorage data to Supabase
// ============================================================================

export async function migrateLocalStorageToSupabase(): Promise<{ doses: number; profile: boolean }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { doses: 0, profile: false };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { doses: 0, profile: false };

  let doseCount = 0;
  let profileMigrated = false;

  // Migrate doses
  const savedDoses = localStorage.getItem('doses');
  if (savedDoses) {
    try {
      const doses: Dose[] = JSON.parse(savedDoses).map((d: any) => ({
        ...d,
        datetime: new Date(d.datetime),
      }));

      if (doses.length > 0) {
        const dbDoses = doses.map(dose => doseToDb(dose, user.id));
        const { error } = await supabase.from('doses').insert(dbDoses);
        if (!error) {
          doseCount = doses.length;
          localStorage.removeItem('doses');
        }
      }
    } catch (e) {
      console.error('Error migrating doses:', e);
    }
  }

  // Migrate patient profile
  const savedProfile = localStorage.getItem('patientProfile');
  if (savedProfile) {
    try {
      const profile: PatientProfile = JSON.parse(savedProfile);
      if (profile.lastAssessmentDate) {
        profile.lastAssessmentDate = new Date(profile.lastAssessmentDate);
      }

      const dbProfile = profileToDb(profile, user.id);
      const { error } = await supabase.from('patient_profile').insert(dbProfile);
      if (!error) {
        profileMigrated = true;
        localStorage.removeItem('patientProfile');
      }
    } catch (e) {
      console.error('Error migrating patient profile:', e);
    }
  }

  return { doses: doseCount, profile: profileMigrated };
}
