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
  if (language === "es" && spanish) return polishSpanishText(spanish);
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
