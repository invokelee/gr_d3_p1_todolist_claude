let _locale = 'ko';
let _strings = {};

export function detectLocale() {
  const saved = localStorage.getItem('flowo_locale');
  if (saved) return saved;
  const lang = navigator.language || 'ko';
  return lang.startsWith('ko') ? 'ko' : 'en';
}

export async function setLocale(locale) {
  _locale = locale;
  try {
    const res = await fetch(`/src/i18n/${locale}.json`);
    _strings = await res.json();
  } catch {
    _strings = {};
  }
  localStorage.setItem('flowo_locale', locale);
  document.documentElement.lang = locale;
}

export function t(key, fallback = key) {
  return _strings[key] ?? fallback;
}

export function getLocale() {
  return _locale;
}
