// test-utils/setup-globals.ts
// Run before any test files are loaded
/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */

// Leichte Fetch-/Web-APIs-Absicherung ohne undici
try {
  const g: any = globalThis as any;
  // URL/URLSearchParams
  if (!g.URL) {
    g.URL = require('url').URL;
  }
  if (!g.URLSearchParams) {
    g.URLSearchParams = require('url').URLSearchParams;
  }
  // Blob (Minimal)
  if (!g.Blob) {
    g.Blob = class Blob {
      parts: any[];
      options: any;
      constructor(parts: any[] = [], options: any = {}) {
        this.parts = parts;
        this.options = options;
      }
      text() {
        return Promise.resolve(this.parts.join(''));
      }
      size() {
        return this.parts.reduce((acc, part) => acc + (part?.length || 0), 0);
      }
      type() {
        return this.options.type || '';
      }
    };
  }
  // FormData (Minimal)
  if (!g.FormData) {
    g.FormData = class FormData {
      _entries: [string, any][] = [];
      append(name: string, value: any) {
        this._entries.push([name, value]);
      }
      delete(name: string) {
        this._entries = this._entries.filter(([n]) => n !== name);
      }
      get(name: string) {
        const e = this._entries.find(([n]) => n === name);
        return e ? e[1] : null;
      }
      getAll(name: string) {
        return this._entries.filter(([n]) => n === name).map(([, v]) => v);
      }
      has(name: string) {
        return this._entries.some(([n]) => n === name);
      }
      set(name: string, value: any) {
        const i = this._entries.findIndex(([n]) => n === name);
        i !== -1 ? this._entries.splice(i, 1, [name, value]) : this._entries.push([name, value]);
      }
      *entries() {
        for (const e of this._entries) yield e;
      }
      *keys() {
        for (const [n] of this._entries) yield n;
      }
      *values() {
        for (const [, v] of this._entries) yield v;
      }
      [Symbol.iterator]() {
        return this.entries();
      }
    };
  }
} catch (error) {
  console.error('Failed to set up global polyfills:', error);
}

// Provide minimal navigator for libraries expecting it (e.g., user-event Clipboard utils)
try {
  const g: any = globalThis as any;
  if (!g.navigator) {
    g.navigator = {};
  }
  if (!g.navigator.clipboard) {
    g.navigator.clipboard = {
      writeText: async () => {},
      readText: async () => '',
    };
  }

  const safeDefine = (obj: any, prop: string, value: any) => {
    try {
      Object.defineProperty(obj, prop, { value, configurable: true, writable: true });
      return true;
    } catch {}
    try {
      obj[prop] = value;
      return true;
    } catch {}
    return false;
  };

  // Add userAgent for Next.js
  if (!g.navigator.userAgent) {
    safeDefine(g.navigator, 'userAgent', 'node');
  }

  // Add language for i18n
  if (!g.navigator.language) {
    safeDefine(g.navigator, 'language', 'en-US');
  }

  // Add platform
  if (!g.navigator.platform) {
    safeDefine(g.navigator, 'platform', 'node');
  }
} catch (error) {
  console.error('Failed to set up navigator polyfills:', error);
}

if (typeof (globalThis as any).performance === 'undefined') {
  (globalThis as any).performance = { now: () => Date.now() } as any;
}

// Polyfill requestAnimationFrame and cancelAnimationFrame
if (typeof (globalThis as any).requestAnimationFrame === 'undefined') {
  (globalThis as any).requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(() => callback(performance.now()), 0) as unknown as number;
  };
  (globalThis as any).cancelAnimationFrame = (id: number) => {
    clearTimeout(id);
  };
}

// Polyfill IntersectionObserver used by animation/visibility components in jsdom
(() => {
  const g: any = globalThis as any;
  if (typeof g.IntersectionObserver === 'undefined') {
    class IO {
      constructor(_cb: any, _opts?: any) {}
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    g.IntersectionObserver = IO as any;
  }
})();
