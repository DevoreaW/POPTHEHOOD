export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';

  // Slice first to bound all subsequent regex work and prevent ReDoS
  return input
    .slice(0, 2000)
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove HTML tags (simple, non-backtracking pattern)
    .replace(/<[^>]*>/g, '')
    // Remove dangerous protocols
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    // Remove inline event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

export function validateRequired(fields) {
  for (const [key, value] of Object.entries(fields)) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return { valid: false, error: `${key} is required` };
    }
  }
  return { valid: true };
}

export function sanitizeErrorMessage(error) {
  // Never expose internal error details to users
  const safeMessages = {
    'rate_limit': 'Too many requests. Please try again later.',
    'invalid_input': 'Invalid input provided. Please check your submission.',
    'server_error': 'Something went wrong. Please try again.',
    'not_found': 'The requested resource was not found.',
    'unauthorized': 'You are not authorized to perform this action.',
  };

  if (!error || typeof error !== 'string') {
    return safeMessages.server_error;
  }

  // Check if it's a known safe message
  const lowerError = error.toLowerCase();
  if (lowerError.includes('rate limit') || lowerError.includes('too many')) return safeMessages.rate_limit;
  if (lowerError.includes('invalid') || lowerError.includes('required')) return safeMessages.invalid_input;
  if (lowerError.includes('not found')) return safeMessages.not_found;
  if (lowerError.includes('unauthorized') || lowerError.includes('forbidden')) return safeMessages.unauthorized;

  // Default to generic message to avoid leaking internals
  return safeMessages.server_error;
}