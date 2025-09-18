'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { RuntimeConfig, setRuntimeConfig } from './runtimeConfigStore';

const ConfigCtx = createContext<RuntimeConfig | null>(null);

export function useConfig() {
  const cfg = useContext(ConfigCtx);
  if (!cfg) throw new Error("Config not loaded yet");
  return cfg;
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [cfg, setCfg] = useState<RuntimeConfig | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/config.json', { cache: 'no-store' });
      const json: RuntimeConfig = await res.json();
      setCfg(json);
      setRuntimeConfig(json); // ✅ also populate global store
    })();
  }, []);

  if (!cfg) return null;
  return <ConfigCtx.Provider value={cfg}>{children}</ConfigCtx.Provider>;
}
