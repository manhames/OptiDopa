/**
 * TypeScript types for Supabase database schema
 * These match the SQL schema in SUPABASE_SETUP.md
 */

export type Database = {
  public: {
    Tables: {
      doses: {
        Row: {
          id: string;
          user_id: string;
          datetime: string;
          medication: 'Carbilev' | 'Sinemet CR';
          dose_amount: 'Full' | 'Half';
          dose_mg: number;
          formulation: 'IR' | 'CR';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          datetime: string;
          medication: 'Carbilev' | 'Sinemet CR';
          dose_amount: 'Full' | 'Half';
          dose_mg: number;
          formulation: 'IR' | 'CR';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          datetime?: string;
          medication?: 'Carbilev' | 'Sinemet CR';
          dose_amount?: 'Full' | 'Half';
          dose_mg?: number;
          formulation?: 'IR' | 'CR';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      patient_profile: {
        Row: {
          id: string;
          user_id: string;
          observed_min_effective: number | null;
          observed_optimal_range_min: number | null;
          observed_optimal_range_max: number | null;
          observed_dyskinesia_threshold: number | null;
          tremor_returns: number | null;
          slowness_returns: number | null;
          stiffness_rigidity: number | null;
          difficulty_getting_up: number | null;
          smaller_handwriting: number | null;
          shuffling_freezing: number | null;
          anxiety_panic: number | null;
          fatigue_low_energy: number | null;
          pain_aching: number | null;
          sweating: number | null;
          mood_changes: number | null;
          involuntary_movements: number | null;
          restlessness: number | null;
          feeling_jittery: number | null;
          head_bobbing: number | null;
          trunk_swaying: number | null;
          hours_until_best_response: number | null;
          hours_until_symptoms_return: number | null;
          duration_of_good_time: number | null;
          current_motor_state: 'ON' | 'OFF' | 'ON_WITH_DYSKINESIA' | 'OFF_WITH_DYSKINESIA' | null;
          notes: string | null;
          last_assessment_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          observed_min_effective?: number | null;
          observed_optimal_range_min?: number | null;
          observed_optimal_range_max?: number | null;
          observed_dyskinesia_threshold?: number | null;
          tremor_returns?: number | null;
          slowness_returns?: number | null;
          stiffness_rigidity?: number | null;
          difficulty_getting_up?: number | null;
          smaller_handwriting?: number | null;
          shuffling_freezing?: number | null;
          anxiety_panic?: number | null;
          fatigue_low_energy?: number | null;
          pain_aching?: number | null;
          sweating?: number | null;
          mood_changes?: number | null;
          involuntary_movements?: number | null;
          restlessness?: number | null;
          feeling_jittery?: number | null;
          head_bobbing?: number | null;
          trunk_swaying?: number | null;
          hours_until_best_response?: number | null;
          hours_until_symptoms_return?: number | null;
          duration_of_good_time?: number | null;
          current_motor_state?: 'ON' | 'OFF' | 'ON_WITH_DYSKINESIA' | 'OFF_WITH_DYSKINESIA' | null;
          notes?: string | null;
          last_assessment_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          observed_min_effective?: number | null;
          observed_optimal_range_min?: number | null;
          observed_optimal_range_max?: number | null;
          observed_dyskinesia_threshold?: number | null;
          tremor_returns?: number | null;
          slowness_returns?: number | null;
          stiffness_rigidity?: number | null;
          difficulty_getting_up?: number | null;
          smaller_handwriting?: number | null;
          shuffling_freezing?: number | null;
          anxiety_panic?: number | null;
          fatigue_low_energy?: number | null;
          pain_aching?: number | null;
          sweating?: number | null;
          mood_changes?: number | null;
          involuntary_movements?: number | null;
          restlessness?: number | null;
          feeling_jittery?: number | null;
          head_bobbing?: number | null;
          trunk_swaying?: number | null;
          hours_until_best_response?: number | null;
          hours_until_symptoms_return?: number | null;
          duration_of_good_time?: number | null;
          current_motor_state?: 'ON' | 'OFF' | 'ON_WITH_DYSKINESIA' | 'OFF_WITH_DYSKINESIA' | null;
          notes?: string | null;
          last_assessment_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
