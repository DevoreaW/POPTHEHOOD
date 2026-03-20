export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    // Remove ALL HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove javascript protocol
    .replace(/javascript:/gi, '')
    // Remove data protocol (can be used for XSS)
    .replace(/data:/gi, '')
    // Remove vbscript protocol
    .replace(/vbscript:/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove script tags more aggressively
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove potentially dangerous characters used in SQL injection
    .replace(/(\b)(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|EXECUTE|ALTER|CREATE|TRUNCATE)(\b)/gi, '')
    // Remove null bytes
    .replace(/\0/g, '')
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