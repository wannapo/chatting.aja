"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { translations, type TranslationKey } from "./dictionary";
import { RTL_LANGUAGES, LANGUAGES } from "./languages";

export { LANGUAGES };
export type { TranslationKey };

interface LanguageContextValue {
  lang: string;
  setLang: (code: string) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "id",
  setLang: () => {},
  t: (key) => translations.id[key],
});

const STORAGE_KEY = "chatting-aja-language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState("id");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial = saved && translations[saved] ? saved : "id";
    setLangState(initial);
    document.documentElement.setAttribute("dir", RTL_LANGUAGES.has(initial) ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", initial);
  }, []);

  function setLang(code: string) {
    setLangState(code);
    localStorage.setItem(STORAGE_KEY, code);
    document.documentElement.setAttribute("dir", RTL_LANGUAGES.has(code) ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", code);
  }

  function t(key: TranslationKey): string {
    return translations[lang]?.[key] ?? translations.id[key] ?? key;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
