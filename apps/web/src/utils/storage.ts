import Cookies from 'js-cookie';

export function getStorageItem<T>(key: string): T | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save storage item ${key}:`, err);
  }
}

export function removeStorageItem(key: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(key);
}

export function getCookieItem(key: string): string | undefined {
  return Cookies.get(key);
}

export function setCookieItem(key: string, value: string, options?: Cookies.CookieAttributes): void {
  Cookies.set(key, value, options);
}

export function removeCookieItem(key: string): void {
  Cookies.remove(key);
}
