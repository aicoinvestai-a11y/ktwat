'use client';

/**
 * التفضيلات المحلية — خطوتي
 * كل شيء يُخزَّن في LocalStorage على جهاز المستخدم فقط. لا يرسل الموقع أي بيانات إلى أي سيرفر.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { siteConfig } from '@/config/site.config';
import { audioService, type AudioSettings } from './audio/service';

const K = siteConfig.storageKeyPrefix;

export const STORAGE_KEYS = {
  favorites: `${K}.favorites`,
  visited: `${K}.visited`,
  practiced: `${K}.practiced`,
  audio: `${K}.audio`,
  quiet: `${K}.quiet`,
} as const;

interface PrefsValue {
  ready: boolean;
  favorites: string[];
  visited: string[];
  practiced: string[];
  audio: AudioSettings;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  markVisited: (id: string) => void;
  markPracticed: (id: string) => void;
  isPracticed: (id: string) => boolean;
  setAudio: (patch: Partial<AudioSettings>) => void;
  toggleQuiet: () => void;
  clearAll: () => void;
}

const PrefsContext = createContext<PrefsValue | null>(null);

function readArray(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function readObject<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...fallback, ...(JSON.parse(raw) as T) } : fallback;
  } catch {
    return fallback;
  }
}

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([]);
  const [practiced, setPracticed] = useState<string[]>([]);
  const [audio, setAudioState] = useState<AudioSettings>(() => audioService.getSettings());

  useEffect(() => {
    setFavorites(readArray(STORAGE_KEYS.favorites));
    setVisited(readArray(STORAGE_KEYS.visited));
    setPracticed(readArray(STORAGE_KEYS.practiced));
    const stored = readObject<Partial<AudioSettings>>(STORAGE_KEYS.audio, {});
    const quiet = window.localStorage.getItem(STORAGE_KEYS.quiet);
    const next = { ...audioService.getSettings(), ...stored, quiet: quiet === '1' ? true : stored.quiet ?? false };
    setAudioState(next);
    audioService.setSettings(next);
    setReady(true);
    // احترام prefers-reduced-motion تلقائياً للوضع الهادئ
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (mq?.matches) {
      audioService.setSettings({ quiet: true });
      setAudioState((a) => ({ ...a, quiet: true }));
      document.documentElement.classList.add('quiet');
    }
  }, []);

  useEffect(() => {
    if (ready) document.documentElement.classList.toggle('quiet', audio.quiet);
  }, [audio.quiet, ready]);

  const persist = useCallback((key: string, value: unknown) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* تجاهل */
    }
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        persist(STORAGE_KEYS.favorites, next);
        return next;
      });
    },
    [persist],
  );

  const markVisited = useCallback(
    (id: string) => {
      setVisited((prev) => {
        if (prev.includes(id)) return prev;
        const next = [id, ...prev].slice(0, 300);
        persist(STORAGE_KEYS.visited, next);
        return next;
      });
    },
    [persist],
  );

  const markPracticed = useCallback(
    (id: string) => {
      setPracticed((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        persist(STORAGE_KEYS.practiced, next);
        return next;
      });
    },
    [persist],
  );

  const setAudio = useCallback(
    (patch: Partial<AudioSettings>) => {
      audioService.setSettings(patch);
      const next = audioService.getSettings();
      setAudioState(next);
      persist(STORAGE_KEYS.audio, next);
      if (patch.quiet !== undefined) {
        try {
          window.localStorage.setItem(STORAGE_KEYS.quiet, patch.quiet ? '1' : '0');
        } catch {
          /* تجاهل */
        }
      }
    },
    [persist],
  );

  const toggleQuiet = useCallback(() => {
    setAudio({ quiet: !audioService.getSettings().quiet });
  }, [setAudio]);

  const clearAll = useCallback(() => {
    try {
      Object.values(STORAGE_KEYS).forEach((k) => window.localStorage.removeItem(k));
    } catch {
      /* تجاهل */
    }
    setFavorites([]);
    setVisited([]);
    setPracticed([]);
  }, []);

  const value = useMemo<PrefsValue>(
    () => ({
      ready,
      favorites,
      visited,
      practiced,
      audio,
      toggleFavorite,
      isFavorite: (id: string) => favorites.includes(id),
      markVisited,
      markPracticed,
      isPracticed: (id: string) => practiced.includes(id),
      setAudio,
      toggleQuiet,
      clearAll,
    }),
    [ready, favorites, visited, practiced, audio, toggleFavorite, markVisited, markPracticed, setAudio, toggleQuiet, clearAll],
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs(): PrefsValue {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs must be used inside PrefsProvider');
  return ctx;
}
