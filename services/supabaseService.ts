import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Save a diagnostic report to Supabase
export const saveDiagnostic = async (userId: string, vehicleInfo: any, report: any) => {
  const { data, error } = await supabase
    .from('diagnostics')
    .insert({
      user_id: userId,
      vehicle_make: vehicleInfo.make,
      vehicle_model: vehicleInfo.model,
      vehicle_year: vehicleInfo.year,
      vehicle_mileage: vehicleInfo.mileage,
      description: report.analysisSummary,
      report: report
    });

  if (error) {
    console.error('Error saving diagnostic:', error);
    throw error;
  }
  return data;
};

// Save a tire scan report to Supabase
export const saveTireScan = async (userId: string, report: any) => {
  const { data, error } = await supabase
    .from('tire_scans')
    .insert({
      user_id: userId,
      report: report
    });

  if (error) {
    console.error('Error saving tire scan:', error);
    throw error;
  }
  return data;
};

// Get all diagnostics for a user
export const getUserDiagnostics = async (userId: string) => {
  const { data, error } = await supabase
    .from('diagnostics')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching diagnostics:', error);
    throw error;
  }
  return data;
};

// Get all tire scans for a user
export const getUserTireScans = async (userId: string) => {
  const { data, error } = await supabase
    .from('tire_scans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tire scans:', error);
    throw error;
  }
  return data;
};

// Delete a diagnostic
export const deleteDiagnostic = async (id: string) => {
  const { error } = await supabase
    .from('diagnostics')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting diagnostic:', error);
    throw error;
  }
};

// Delete a tire scan
export const deleteTireScan = async (id: string) => {
  const { error } = await supabase
    .from('tire_scans')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting tire scan:', error);
    throw error;
  }
};