export function toFirestoreData<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => toFirestoreData(item)) as T;
  }

  if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) {
    return value;
  }

  return Object.entries(value).reduce<Record<string, unknown>>((acc, [key, entry]) => {
    if (entry !== undefined) {
      acc[key] = toFirestoreData(entry);
    }

    return acc;
  }, {}) as T;
}
