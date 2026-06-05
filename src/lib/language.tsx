import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { hasSupabaseEnv, supabase } from "./supabase";
import { translationCatalog } from "./translation-catalog";

export type AppLanguage = "en" | "es";
type TranslationOverrideMap = Record<string, string>;

type TranslationOverrideRow = {
  english_key: string;
  spanish_text: string;
};

export type TranslationManagerEntry = {
  english: string;
  defaultSpanish: string;
  currentSpanish: string;
  overridden: boolean;
};

const LANGUAGE_STORAGE_KEY = "fluent-with-sena-language";
let activeLanguage: AppLanguage = "en";
let activeTranslationOverrides: TranslationOverrideMap = {};

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  translationOverrides: TranslationOverrideMap;
  translationsLoading: boolean;
  translationsError: string | null;
  refreshTranslations: () => Promise<void>;
  saveTranslationOverride: (english: string, spanish: string) => Promise<void>;
  deleteTranslationOverride: (english: string) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const SPANISH_PHRASE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\blinea de tiempo\b/gi, "cronología"],
  [/\blínea de tiempo\b/gi, "cronología"],
  [/\bBiblioteca de inmersion\b/g, "Biblioteca de inmersión"],
  [/\bbiblioteca de inmersion\b/g, "biblioteca de inmersión"],
  [/\bRepeticion de sesion\b/g, "Repetición de la sesión"],
  [/\brepeticion de sesion\b/g, "repetición de la sesión"],
  [/\bRepeticion disponible en el historial de grabaciones\b/g, "La repetición está disponible en el historial de grabaciones"],
  [/\brepeticion disponible en el historial de grabaciones\b/g, "La repetición está disponible en el historial de grabaciones"],
  [/\bQue escuchar esta semana\b/g, "Qué escuchar esta semana"],
  [/\bQue salio bien en ingles esta semana\?/g, "¿Qué salió bien en inglés esta semana?"],
  [/\bComo te sientes con tu ingles en este momento\?/g, "¿Cómo te sientes con tu inglés en este momento?"],
  [/\bHay algo mas relevante para tu aplicacion\?/g, "¿Hay algo más relevante para tu aplicación?"],
  [/\bYa eres cliente\?/g, "¿Ya eres cliente?"],
  [/\bOlvidaste tu contrasena\?/g, "¿Olvidaste tu contraseña?"],
];

const SPANISH_WORD_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bcontrasena\b/gi, "contraseña"],
  [/\bcontrasenas\b/gi, "contraseñas"],
  [/\bconfiguracion\b/gi, "configuración"],
  [/\bmusica\b/gi, "música"],
  [/\bingles\b/gi, "inglés"],
  [/\bsesion\b/gi, "sesión"],
  [/\bgrabacion\b/gi, "grabación"],
  [/\brepeticion\b/gi, "repetición"],
  [/\binmersion\b/gi, "inmersión"],
  [/\bcomunicacion\b/gi, "comunicación"],
  [/\bpresentacion\b/gi, "presentación"],
  [/\bnegociacion\b/gi, "negociación"],
  [/\bnumero\b/gi, "número"],
  [/\btelefono\b/gi, "teléfono"],
  [/\bproxima\b/gi, "próxima"],
  [/\bproximas\b/gi, "próximas"],
  [/\bproximo\b/gi, "próximo"],
  [/\bproximos\b/gi, "próximos"],
  [/\bultima\b/gi, "última"],
  [/\bultimas\b/gi, "últimas"],
  [/\bultimo\b/gi, "último"],
  [/\bultimos\b/gi, "últimos"],
  [/\btitulo\b/gi, "título"],
  [/\bdia\b/gi, "día"],
  [/\bdias\b/gi, "días"],
  [/\baun\b/gi, "aún"],
  [/\btodavia\b/gi, "todavía"],
  [/\baqui\b/gi, "aquí"],
  [/\bmas\b/gi, "más"],
  [/\bdespues\b/gi, "después"],
  [/\bpodra\b/gi, "podrá"],
  [/\bpodran\b/gi, "podrán"],
  [/\bpodras\b/gi, "podrás"],
  [/\baparecera\b/gi, "aparecerá"],
  [/\bapareceran\b/gi, "aparecerán"],
  [/\bagregara\b/gi, "agregará"],
  [/\bagregaran\b/gi, "agregarán"],
  [/\bdejara\b/gi, "dejará"],
  [/\bdefinira\b/gi, "definirá"],
  [/\bestara\b/gi, "estará"],
  [/\bestaran\b/gi, "estarán"],
  [/\bautoevaluacion\b/gi, "autoevaluación"],
  [/\bgramatica\b/gi, "gramática"],
  [/\bmetodos\b/gi, "métodos"],
  [/\binversion\b/gi, "inversión"],
  [/\baplicacion\b/gi, "aplicación"],
  [/\bcomodo\b/gi, "cómodo"],
  [/\bprecision\b/gi, "precisión"],
  [/\bversion\b/gi, "versión"],
  [/\btransformacion\b/gi, "transformación"],
  [/\breunion\b/gi, "reunión"],
  [/\bbusqueda\b/gi, "búsqueda"],
  [/\bpequeno\b/gi, "pequeño"],
  [/\bpequena\b/gi, "pequeña"],
  [/\bpequenos\b/gi, "pequeños"],
  [/\bpequenas\b/gi, "pequeñas"],
  [/\bensenarte\b/gi, "enseñarte"],
  [/\bensenaran\b/gi, "enseñarán"],
  [/\bensena\b/gi, "enseña"],
  [/\bsalio\b/gi, "salió"],
];

function preserveMatchCase(match: string, replacement: string) {
  if (!match) return replacement;
  if (match === match.toUpperCase()) return replacement.toUpperCase();
  if (match[0] === match[0]?.toUpperCase()) {
    return replacement[0]?.toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function polishSpanishText(text: string) {
  let next = text;

  for (const [pattern, replacement] of SPANISH_PHRASE_REPLACEMENTS) {
    next = next.replace(pattern, (match) => preserveMatchCase(match, replacement));
  }

  for (const [pattern, replacement] of SPANISH_WORD_REPLACEMENTS) {
    next = next.replace(pattern, (match) => preserveMatchCase(match, replacement));
  }

  return next;
}

function getStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") {
    return "en";
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === "es" ? "es" : "en";
}

function mapOverrideRows(rows: TranslationOverrideRow[]) {
  return rows.reduce<TranslationOverrideMap>((next, row) => {
    const english = row.english_key.trim();
    const spanish = row.spanish_text.trim();
    if (english && spanish) next[english] = spanish;
    return next;
  }, {});
}

export function currentAppLanguage(): AppLanguage {
  return activeLanguage;
}

export function appLanguageLocale(language = currentAppLanguage()) {
  return language === "es" ? "es" : "en";
}

export function translateText(
  language: AppLanguage,
  english: string,
  spanish?: string,
  overrides: TranslationOverrideMap = activeTranslationOverrides,
) {
  if (language === "es") {
    const overrideSpanish = overrides[english];
    const resolvedSpanish = overrideSpanish ?? spanish;
    if (resolvedSpanish) return polishSpanishText(resolvedSpanish);
  }
  return english;
}

export function translateCurrent(english: string, spanish?: string) {
  return translateText(currentAppLanguage(), english, spanish);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("en");
  const [hasHydratedLanguage, setHasHydratedLanguage] = useState(false);
  const [translationOverrides, setTranslationOverrides] = useState<TranslationOverrideMap>({});
  const [translationsLoading, setTranslationsLoading] = useState(hasSupabaseEnv);
  const [translationsError, setTranslationsError] = useState<string | null>(null);

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

  const refreshTranslations = useCallback(async () => {
    if (!hasSupabaseEnv || !supabase) {
      activeTranslationOverrides = {};
      setTranslationOverrides({});
      setTranslationsError(null);
      setTranslationsLoading(false);
      return;
    }

    setTranslationsLoading(true);
    setTranslationsError(null);

    const { data, error } = await supabase
      .from("translation_overrides")
      .select("english_key, spanish_text")
      .order("english_key", { ascending: true });

    if (error) {
      setTranslationsError(error.message);
      setTranslationsLoading(false);
      throw error;
    }

    const nextOverrides = mapOverrideRows((data ?? []) as TranslationOverrideRow[]);
    activeTranslationOverrides = nextOverrides;
    setTranslationOverrides(nextOverrides);
    setTranslationsLoading(false);
  }, []);

  const saveTranslationOverride = useCallback(async (english: string, spanish: string) => {
    if (!hasSupabaseEnv || !supabase) {
      throw new Error("Supabase is not configured.");
    }

    const normalizedEnglish = english.trim();
    const normalizedSpanish = spanish.trim();
    if (!normalizedEnglish) throw new Error("English source text is required.");
    if (!normalizedSpanish) throw new Error("Spanish translation is required.");

    const { error } = await supabase.from("translation_overrides").upsert({
      english_key: normalizedEnglish,
      spanish_text: normalizedSpanish,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    setTranslationOverrides((current) => {
      const nextOverrides = {
        ...current,
        [normalizedEnglish]: normalizedSpanish,
      };
      activeTranslationOverrides = nextOverrides;
      return nextOverrides;
    });
  }, []);

  const deleteTranslationOverride = useCallback(async (english: string) => {
    if (!hasSupabaseEnv || !supabase) {
      throw new Error("Supabase is not configured.");
    }

    const normalizedEnglish = english.trim();
    if (!normalizedEnglish) throw new Error("English source text is required.");

    const { error } = await supabase
      .from("translation_overrides")
      .delete()
      .eq("english_key", normalizedEnglish);

    if (error) throw error;

    setTranslationOverrides((current) => {
      const nextOverrides = { ...current };
      delete nextOverrides[normalizedEnglish];
      activeTranslationOverrides = nextOverrides;
      return nextOverrides;
    });
  }, []);

  useEffect(() => {
    const storedLanguage = getStoredLanguage();
    activeLanguage = storedLanguage;

    if (typeof document !== "undefined") {
      document.documentElement.lang = storedLanguage;
    }

    setLanguageState(storedLanguage);
    setHasHydratedLanguage(true);
  }, []);

  useEffect(() => {
    void refreshTranslations().catch(() => undefined);
  }, [refreshTranslations]);

  useEffect(() => {
    activeLanguage = language;

    if (!hasHydratedLanguage) {
      if (typeof document !== "undefined") {
        document.documentElement.lang = language;
      }
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }

    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [hasHydratedLanguage, language]);

  useEffect(() => {
    activeTranslationOverrides = translationOverrides;
  }, [translationOverrides]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      translationOverrides,
      translationsLoading,
      translationsError,
      refreshTranslations,
      saveTranslationOverride,
      deleteTranslationOverride,
    }),
    [
      deleteTranslationOverride,
      language,
      refreshTranslations,
      saveTranslationOverride,
      setLanguage,
      translationOverrides,
      translationsError,
      translationsLoading,
    ],
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
  const { language, translationOverrides } = useAppLanguage();

  return useCallback(
    (english: string, spanish?: string) =>
      translateText(language, english, spanish, translationOverrides),
    [language, translationOverrides],
  );
}

export function useTranslationManager() {
  const {
    translationOverrides,
    translationsLoading,
    translationsError,
    refreshTranslations,
    saveTranslationOverride,
    deleteTranslationOverride,
  } = useAppLanguage();

  const entries = useMemo<TranslationManagerEntry[]>(() => {
    const deduped = new Map<string, TranslationManagerEntry>();

    for (const entry of translationCatalog) {
      const overriddenSpanish = translationOverrides[entry.english];
      deduped.set(entry.english, {
        english: entry.english,
        defaultSpanish: entry.spanish,
        currentSpanish: overriddenSpanish ?? entry.spanish,
        overridden: overriddenSpanish != null,
      });
    }

    for (const [english, spanish] of Object.entries(translationOverrides)) {
      if (deduped.has(english)) continue;
      deduped.set(english, {
        english,
        defaultSpanish: spanish,
        currentSpanish: spanish,
        overridden: true,
      });
    }

    return [...deduped.values()].sort((left, right) => left.english.localeCompare(right.english));
  }, [translationOverrides]);

  return {
    entries,
    translationsLoading,
    translationsError,
    refreshTranslations,
    saveTranslationOverride,
    deleteTranslationOverride,
  };
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
