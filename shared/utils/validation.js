export class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function assert(condition, message, details = {}) {
  if (!condition) {
    throw new ValidationError(message, details);
  }
}

export function requireString(value, field, options = {}) {
  assert(typeof value === 'string', `${field} must be a string`, { field, value });
  if (options.nonEmpty !== false) {
    assert(value.length > 0, `${field} must not be empty`, { field });
  }
  if (options.maxLength) {
    assert(value.length <= options.maxLength, `${field} is too long`, { field, maxLength: options.maxLength });
  }
  return value;
}

export function requireNumber(value, field, options = {}) {
  assert(typeof value === 'number' && Number.isFinite(value), `${field} must be a finite number`, { field, value });
  if (options.integer) {
    assert(Number.isInteger(value), `${field} must be an integer`, { field, value });
  }
  if (options.min !== undefined) {
    assert(value >= options.min, `${field} must be >= ${options.min}`, { field, value });
  }
  if (options.max !== undefined) {
    assert(value <= options.max, `${field} must be <= ${options.max}`, { field, value });
  }
  return value;
}

export function requireArray(value, field, options = {}) {
  assert(Array.isArray(value), `${field} must be an array`, { field, value });
  if (options.minLength !== undefined) {
    assert(value.length >= options.minLength, `${field} must contain at least ${options.minLength} item(s)`, { field });
  }
  if (options.maxLength !== undefined) {
    assert(value.length <= options.maxLength, `${field} must contain at most ${options.maxLength} item(s)`, { field });
  }
  return value;
}

export function optionalArray(value, field) {
  if (value === undefined || value === null) return [];
  return requireArray(value, field);
}

export function toErrorObject(error) {
  return {
    name: error?.name || 'Error',
    message: error?.message || String(error),
    details: error?.details || undefined
  };
}
