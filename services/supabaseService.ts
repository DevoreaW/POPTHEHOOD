// All Supabase calls go through our secure backend API.
// The token (Clerk session JWT) is verified server-side; userId is never trusted from the client.

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const saveDiagnostic = async (token: string, vehicleInfo: any, report: any) => {
  const response = await fetch('/api/supabase', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ action: 'saveDiagnostic', data: { ...report, vehicle: vehicleInfo } })
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result;
};

export const saveTireScan = async (token: string, report: any) => {
  const response = await fetch('/api/supabase', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ action: 'saveTireScan', data: report })
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result;
};

export const getUserDiagnostics = async (token: string) => {
  const response = await fetch('/api/supabase', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ action: 'getDiagnostics' })
  });
  const result = await response.json();
  if (result.error) throw new Error(result.error);
  return result.data;
};

export const getUserTireScans = async (token: string) => {
  const response = await fetch('/api/supabase', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ action: 'getTireScans' })
  });
  const result = await response.json();
  if (result.error) throw new Error(result.error);
  return result.data;
};

export const deleteDiagnostic = async (id: string, token: string) => {
  const response = await fetch('/api/supabase', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ action: 'deleteDiagnostic', data: { id } })
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result;
};

export const deleteTireScan = async (id: string, token: string) => {
  const response = await fetch('/api/supabase', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ action: 'deleteTireScan', data: { id } })
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result;
};
