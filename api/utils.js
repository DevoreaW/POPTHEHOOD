export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script-related characters
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Trim whitespace
    .trim()
    // Limit length to 2000 characters
    .slice(0, 2000);
}

export function validateRequired(fields) {
  for (const [key, value] of Object.entries(fields)) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return { valid: false, error: `${key} is required` };
    }
  }
  return { valid: true };
}