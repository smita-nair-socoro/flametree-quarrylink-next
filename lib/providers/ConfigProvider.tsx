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
        const json: unknown = await res.json();

        // Support both flat config and multi-environment config files.
        // Handle common misspelling "enviornments" as well.
        // Structure:
        // { environments: { dev: RuntimeConfig, essentials: RuntimeConfig } }
        // or { enviornments: { ... } }
        let resolved: RuntimeConfig;
        const maybeObj = json as Record<string, any>;
        const envs =
          (maybeObj && maybeObj.environments) ||
          (maybeObj && maybeObj.enviornments);

        if (envs && typeof envs === 'object') {
          // Determine environment: URL param has highest precedence (?env=essentials|dev)
          let envKey: string | null = null;
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const fromQuery = params.get('env');
            if (fromQuery === 'essentials' || fromQuery === 'dev') {
              envKey = fromQuery;
            } else {
              const host = window.location.host.toLowerCase();
              if (host.includes('.essentials.')) {
                envKey = 'essentials';
              } else if (
                host.includes('.dev.') ||
                host.startsWith('localhost')
              ) {
                envKey = 'dev';
              } else {
                envKey = 'dev';
              }
            }
          } else {
            envKey = 'dev';
          }

          resolved = (envs[envKey!] ||
            envs['dev'] ||
            Object.values(envs)[0]) as RuntimeConfig;
        } else {
          resolved = maybeObj as RuntimeConfig;
        }

        setCfg(resolved);
        setRuntimeConfig(resolved);
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
