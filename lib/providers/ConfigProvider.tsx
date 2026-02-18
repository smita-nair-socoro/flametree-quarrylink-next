'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  RuntimeConfig,
  setRuntimeConfig,
} from '../../app/stores/runtimeConfigStore';
import { Loader2 } from 'lucide-react';

const ConfigCtx = createContext<RuntimeConfig | null>(null);

export function useConfig() {
  const cfg = useContext(ConfigCtx);
  if (!cfg) throw new Error('Config not loaded yet');
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
        console.log('[ConfigProvider] fetched config.json', json);
        setRuntimeConfig(json);
        console.log('[ConfigProvider] setRuntimeConfig done');
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
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  return <ConfigCtx.Provider value={cfg}>{children}</ConfigCtx.Provider>;
}
