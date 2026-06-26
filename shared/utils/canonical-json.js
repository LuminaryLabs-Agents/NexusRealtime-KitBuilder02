function canonicalizeValue(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(canonicalizeValue);
  const sorted = {};
  for (const key of Object.keys(value).sort()) {
    const nested = value[key];
    if (nested !== undefined) sorted[key] = canonicalizeValue(nested);
  }
  return sorted;
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalizeValue(value));
}

export function canonicalClone(value) {
  return JSON.parse(canonicalJson(value));
}
