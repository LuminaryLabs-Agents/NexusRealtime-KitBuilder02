export async function runTestVectors({ manifest, session, requireTestVector = true } = {}) {
  const vectors = manifest.testVectors ?? [];
  if (!vectors.length) return { ok: !requireTestVector, skipped: true, reason: requireTestVector ? 'missing_test_vector' : 'not_required' };
  for (const vector of vectors) {
    if (session?.runTestVector) {
      const result = await session.runTestVector(vector);
      if (!result?.ok) return { ok: false, vector: vector.name, reason: result?.reason ?? 'test_vector_failed' };
    }
  }
  return { ok: true, count: vectors.length };
}
