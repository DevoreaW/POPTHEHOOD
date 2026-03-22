// All Supabase calls go through our secure backend API

export const saveDiagnostic = async (userId: string, vehicleInfo: any, report: any) => {
  const response = await fetch('/api/supabase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'saveDiagnostic', userId, data: { ...report, vehicle: vehicleInfo } })
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result;
};

export const saveTireScan = async (userId: string, report: any) => {
  const response = await fetch('/api/supabase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'saveTireScan', userId, data: report })
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result;
};

export const getUserDiagnostics = async (userId: string) => {
  const response = await fetch('/api/supabase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getDiagnostics', userId })
  });
  const result = await response.json();
  if (result.error) throw new Error(result.error);
  return result.data;
};

export const getUserTireScans = async (userId: string) => {
  const response = await fetch('/api/supabase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getTireScans', userId })
  });
  const result = await response.json();
  if (result.error) throw new Error(result.error);
  return result.data;
};

export const deleteDiagnostic = async (id: string, userId: string) => {
  const response = await fetch('/api/supabase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'deleteDiagnostic', userId, data: { id } })
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result;
};

export const deleteTireScan = async (id: string, userId: string) => {
  const response = await fetch('/api/supabase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'deleteTireScan', userId, data: { id } })
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result;
};
