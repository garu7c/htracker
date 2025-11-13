import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export function createServerSupabaseClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const store = await cookies() as any;

          // If the Next cookies store already implements getAll, use it.
          if (typeof store.getAll === "function") {
            return await store.getAll();
          }

          // Fallback: implement getAll using get (older/newer Next versions expose get)
          if (typeof store.get === "function") {
            const keyHints: string[] = [];

            // supabase passes key hints; but when none are available we try an empty array
            // The createStorage implementation will call getAll with key hints.
            const chunkNames = keyHints.flatMap((k) => [k, ...Array.from({ length: 5 }).map((_, i) => `${k}.${i}`)]);

            // If no hints provided, nothing to fetch — return empty array to avoid crashes.
            if (chunkNames.length === 0) return [];

            const chunks: Array<{ name: string; value: string }> = [];

            for (let i = 0; i < chunkNames.length; i += 1) {
              try {
                const maybe = await store.get(chunkNames[i]);

                // Next's cookies().get may return an object like { name, value }
                const value = maybe && typeof maybe === "object" ? maybe.value : maybe;

                if (typeof value === "undefined" || value === null) continue;

                chunks.push({ name: chunkNames[i], value });
              } catch (e) {
                // ignore individual cookie read errors
              }
            }

            return chunks;
          }

          // As a last resort return empty array
          return [];
        },
        async setAll(cookiesToSet) {
          const store = await cookies() as any;

          if (typeof store.setAll === "function") {
            try {
              return await store.setAll(cookiesToSet as any);
            } catch {}
          }

          // Try to use set/remove/delete/get variants on the Next cookie store
          for (let i = 0; i < cookiesToSet.length; i += 1) {
            const { name, value, options } = cookiesToSet[i];

            try {
              if (value) {
                if (typeof store.set === "function") {
                  // Try both signatures: set(name, value, options) or set({ name, value, ...options })
                  try {
                    await store.set(name, value, options);
                  } catch {
                    await store.set({ name, value, ...(options || {}) });
                  }
                }
              } else {
                // remove cookie
                if (typeof store.delete === "function") {
                  await store.delete(name, options);
                } else if (typeof store.remove === "function") {
                  await store.remove(name, options);
                } else if (typeof store.set === "function") {
                  // fallback: set cookie with maxAge 0
                  try {
                    await store.set(name, "", { ...(options || {}), maxAge: 0 });
                  } catch {
                    await store.set({ name, value: "", ...(options || {}), maxAge: 0 });
                  }
                }
              }
            } catch (e) {
              // ignore; best-effort
            }
          }
        },
      },
    }
  );
}
