import { useEffect, useState } from "react";

const cache = new Map<string, Promise<unknown>>();

export const BASE = import.meta.env.BASE_URL;

export function asset(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:/.test(path)) return path;
  return `${BASE}${path.replace(/^\//, "")}`;
}

export function loadData<T>(name: string): Promise<T> {
  if (!cache.has(name)) {
    cache.set(
      name,
      fetch(`${BASE}data/${name}.json`).then((r) => {
        if (!r.ok) throw new Error(`加载 ${name}.json 失败`);
        return r.json();
      })
    );
  }
  return cache.get(name) as Promise<T>;
}

export function useData<T>(name: string): { data: T | null; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    loadData<T>(name)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(String(e)));
    return () => {
      alive = false;
    };
  }, [name]);
  return { data, error };
}
