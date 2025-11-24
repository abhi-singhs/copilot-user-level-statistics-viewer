"use client";

import { useState, useEffect } from 'react';

export interface PluginVersion {
  version: string;
  releaseDate: string;
}

export interface PluginVersionsResult {
  versions: PluginVersion[];
  isLoading: boolean;
  error: string | null;
}

export function usePluginVersions(type: 'jetbrains' | 'vscode'): PluginVersionsResult {
  const [versions, setVersions] = useState<PluginVersion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadVersions() {
      try {
        setIsLoading(true);
        setError(null);

        const endpoint = type === 'jetbrains' ? '/data/jetbrains.json' : '/data/vscode.json';
        const res = await fetch(endpoint, { cache: 'no-store' });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: unknown = await res.json();

        if (!data || typeof data !== 'object' || !Array.isArray((data as { versions?: unknown }).versions)) {
          throw new Error('Unexpected response shape');
        }

        const versionsArray = (data as { versions: unknown[] }).versions;

        const mapped: PluginVersion[] = versionsArray.map((item) => {
          const obj = item as { version?: unknown; releaseDate?: unknown };
          return {
            version: typeof obj.version === 'string' ? obj.version : 'n/a',
            releaseDate: typeof obj.releaseDate === 'string' 
              ? obj.releaseDate 
              : String(obj.releaseDate ?? ''),
          };
        });

        if (isMounted) {
          setVersions(mapped);
        }
      } catch (e) {
        if (isMounted) {
          setError((e as Error).message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadVersions();

    return () => {
      isMounted = false;
    };
  }, [type]);

  return { versions, isLoading, error };
}
