'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

/* ------------------------------------------------------------------
   Mavzu (tema) tizimi
   - 'light'  → kunduzgi rejim
   - 'dark'   → tungi rejim
   - 'system' → qurilma sozlamasiga ergashadi (prefers-color-scheme)
   Tanlov localStorage'da saqlanadi va barcha ochiq oynalarga tarqaladi.
   Ranglar app/globals.css dagi CSS o‘zgaruvchilari orqali almashadi.
   ------------------------------------------------------------------ */

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'vaqt-tema';
const DARK_QUERY = '(prefers-color-scheme: dark)';

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  resolved: 'light',
  setMode: () => {},
  mounted: false,
});

export const useTheme = () => useContext(ThemeContext);

const isMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system';

function systemPrefersDark() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(DARK_QUERY).matches;
}

export function readStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isMode(stored)) return stored;
  } catch {}
  return 'system';
}

export const resolveTheme = (mode: ThemeMode): ResolvedTheme =>
  mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : mode;

const MODE_NAME: Record<ThemeMode, string> = {
  light: 'Kunduzgi rejim',
  dark: 'Tungi rejim',
  system: 'Tizim rejimi',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [resolved, setResolved] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);
  const [announce, setAnnounce] = useState('');
  const modeRef = useRef<ThemeMode>('system');

  const apply = useCallback((next: ThemeMode) => {
    const effective = resolveTheme(next);
    const root = document.documentElement;
    root.classList.toggle('dark', effective === 'dark');
    root.dataset.theme = effective;
    root.dataset.themeMode = next;
    root.style.colorScheme = effective;
    modeRef.current = next;
    setResolved(effective);
  }, []);

  /* Birinchi yuklashda tanlovni o‘qib qo‘llaymiz (inline skript bilan bir xil natija) */
  useEffect(() => {
    const stored = readStoredMode();
    setModeState(stored);
    apply(stored);
    setMounted(true);
  }, [apply]);

  /* 'system' rejimida qurilma sozlamasi o‘zgarishini kuzatamiz */
  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia(DARK_QUERY);
    const onChange = () => {
      if (modeRef.current === 'system') apply('system');
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [apply]);

  /* Boshqa oynada (tab) tanlov o‘zgarsa — sinxronlaymiz */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_STORAGE_KEY) return;
      const next = isMode(e.newValue) ? e.newValue : 'system';
      setModeState(next);
      apply(next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [apply]);

  const setMode = useCallback(
    (next: ThemeMode) => {
      setModeState(next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {}
      apply(next);
      const effective = resolveTheme(next);
      setAnnounce(
        next === 'system'
          ? `${MODE_NAME.system} yoqildi — hozir ${effective === 'dark' ? 'tungi' : 'kunduzgi'}`
          : `${MODE_NAME[next]} yoqildi`
      );
    },
    [apply]
  );

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode, mounted }}>
      {children}
      <span aria-live="polite" role="status" className="sr-only">
        {announce}
      </span>
    </ThemeContext.Provider>
  );
}

/* Brauzer birinchi marta bo‘yashdan oldin rejimni o‘rnatadi — “miltillash” bo‘lmaydi */
export const themeInitScript = `(function(){try{var k='${THEME_STORAGE_KEY}';var s=window.localStorage.getItem(k);var m=(s==='light'||s==='dark'||s==='system')?s:'system';var d=m==='dark'||(m==='system'&&window.matchMedia&&window.matchMedia('${DARK_QUERY}').matches);var r=document.documentElement;r.classList.toggle('dark',!!d);r.dataset.theme=d?'dark':'light';r.dataset.themeMode=m;r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

const OPTIONS: { value: ThemeMode; label: string; short: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Kunduzgi', short: 'Kun', Icon: Sun },
  { value: 'dark', label: 'Tungi', short: 'Tun', Icon: Moon },
  { value: 'system', label: 'Tizim', short: 'Tizim', Icon: Monitor },
];

/**
 * Uch xil rejimni almashtiruvchi segment tugma (radio-guruh semantikasi bilan).
 * `compact` — tor joylar uchun faqat ikonkalar.
 * `showLabels` — ikonka yonida qisqa matn.
 */
export function ThemeToggle({
  compact = false,
  showLabels = false,
  className = '',
}: {
  compact?: boolean;
  showLabels?: boolean;
  className?: string;
}) {
  const { mode, setMode, mounted } = useTheme();
  const group = useRef<HTMLDivElement>(null);
  /* Serverda 'system' chiziladi; haqiqiy tanlov gidratatsiyadan keyin ko‘rinadi */
  const active: ThemeMode = mounted ? mode : 'system';

  function onKeyDown(e: React.KeyboardEvent) {
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const index = OPTIONS.findIndex((o) => o.value === active);
    let next = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % OPTIONS.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + OPTIONS.length) % OPTIONS.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = OPTIONS.length - 1;
    setMode(OPTIONS[next].value);
    group.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  }

  return (
    <div
      ref={group}
      role="radiogroup"
      aria-label="Ko‘rinish mavzusi"
      onKeyDown={onKeyDown}
      className={`inline-flex items-center gap-1 rounded-xl border border-line bg-surface-soft p-1 ${className}`}
    >
      {OPTIONS.map(({ value, label, short, Icon }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${label} rejim`}
            title={`${label} rejim`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => setMode(value)}
            className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[11px] font-semibold transition ${
              isActive
                ? 'bg-tint text-brand-600 shadow-sm'
                : 'text-ink-3 hover:text-brand-600'
            }`}
          >
            <Icon size={compact ? 16 : 15} strokeWidth={2.2} />
            {(showLabels && !compact) && <span>{short}</span>}
          </button>
        );
      })}
    </div>
  );
}
