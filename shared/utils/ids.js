export function makeId(prefix = 'id') {
  const array = new Uint8Array(12);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(array);
  } else {
    for (let index = 0; index < array.length; index += 1) {
      array[index] = Math.floor(Math.random() * 256);
    }
  }
  const body = [...array].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${body}`;
}

export function nowMs() {
  return Date.now();
}
