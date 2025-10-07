'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { RuntimeConfig, setRuntimeConfig } from '../../app/stores/runtimeConfigStore';

const ConfigCtx = createContext<RuntimeConfig | null>(null);

export function useConfig() {
  const cfg = useContext(ConfigCtx);
  if (!cfg) throw new Error("Config not loaded yet");
  return cfg;
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [cfg, setCfg] = useState<RuntimeConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/config.json', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Failed to load config: ${res.status}`);
        }
        const json: RuntimeConfig = await res.json();
        setCfg(json);
        setRuntimeConfig(json);
      } catch (err) {
        console.error('Failed to load configuration:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load configuration</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!cfg) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading configuration...</p>
        </div>
      </div>
    );
  }
  return <ConfigCtx.Provider value={cfg}>{children}</ConfigCtx.Provider>;
}
