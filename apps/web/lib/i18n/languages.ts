/** Languages offered by the translate control and the settings selector.
 * "en" is the source/off state (shows the original copy). Codes are the
 * Google translate target codes. */

export interface Language {
  code: string;
  label: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh-CN", label: "中文" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
  { code: "ru", label: "Русский" },
];

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

export function isSupportedLanguage(code: string): boolean {
  return LANGUAGE_CODES.includes(code);
}

export function languageLabel(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.label ?? code;
}
