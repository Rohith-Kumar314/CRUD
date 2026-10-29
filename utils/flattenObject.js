export function flattenObject(obj, parentKey = "", result = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const path = parentKey ? `${parentKey}.${key}` : key;
    if (typeof value === "object") {
      flattenObject(value, path, result);
    } else {
      result[path] = value;
    }
  }
  return result;
}
