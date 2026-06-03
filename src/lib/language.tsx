import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AppLanguage = "en" | "es";

const LANGUAGE_STORAGE_KEY = "fluent-with-sena-language";
let activeLanguage: AppLanguage = "en";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") {
    activeLanguage = "en";
    return "en";
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  activeLanguage = stored === "es" ? "es" : "en";
  return activeLanguage;
}

export function currentAppLanguage(): AppLanguage {
  if (typeof document !== "undefined" && document.documentElement.lang) {
    activeLanguage = document.documentElement.lang.startsWith("es") ? "es" : "en";
  }

  return activeLanguage;
}

export function appLanguageLocale(language = currentAppLanguage()) {
  return language === "es" ? "es" : "en";
}

export function translateText(
  language: AppLanguage,
  english: string,
  spanish?: string,
) {
  if (language === "es" && spanish) return spanish;
  return english;
}

export function translateCurrent(english: string, spanish?: string) {
  return translateText(currentAppLanguage(), english, spanish);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(readStoredLanguage);

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    activeLanguage = nextLanguage;

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    }

    if (typeof document !== "undefined") {
      document.documentElement.lang = nextLanguage;
    }

    setLanguageState(nextLanguage);
  }, []);

  useEffect(() => {
    activeLanguage = language;

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }

    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useAppLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useAppLanguage must be used inside LanguageProvider.");
  }

  return context;
}

export function useTranslate() {
  const { language } = useAppLanguage();

  return useCallback(
    (english: string, spanish?: string) => translateText(language, english, spanish),
    [language],
  );
}

export function LanguageToggle({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  const { language, setLanguage } = useAppLanguage();

  return (
    <div
      className={`app-language-toggle${dark ? " dark" : ""}${className ? ` ${className}` : ""}`}
      aria-label="Language selector"
    >
      <button
        type="button"
        className={language === "en" ? "active" : ""}
        onClick={() => setLanguage("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={language === "es" ? "active" : ""}
        onClick={() => setLanguage("es")}
      >
        ES
      </button>
    </div>
  );
}
