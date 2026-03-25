import { KEYS, getJson, setJson } from "./storage";

export async function seedProductsIfEmpty() {
  const existing = getJson(KEYS.products, null);
  if (Array.isArray(existing) && existing.length > 0) return;

  try {
    const res = await fetch("/data/products.json");
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      setJson(KEYS.products, data);
    }
  } catch {
    /* ignore */
  }
}
