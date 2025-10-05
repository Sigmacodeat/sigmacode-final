// Minimal, robust CommonJS mock for next/server used in Jest
// Avoid TS parsing issues by using JS only

// Ensure basic globals exist (fallbacks if undici not loaded yet)
(function polyfill() {
  const g = globalThis;
  try {
    const u = require('undici');
    if (!g.Response && u.Response) g.Response = u.Response;
    if (!g.Headers && u.Headers) g.Headers = u.Headers;
    if (!g.fetch && u.fetch) g.fetch = u.fetch;
  } catch {}
  if (!g.Headers) {
    g.Headers = class Headers {
      constructor(init) {
        this._m = new Map();
        if (init) for (const k in init) this.set(k, init[k]);
      }
      set(k, v) {
        this._m.set(String(k).toLowerCase(), String(v));
      }
      get(k) {
        return this._m.get(String(k).toLowerCase()) ?? null;
      }
      append(k, v) {
        this.set(k, v);
      }
      has(k) {
        return this._m.has(String(k).toLowerCase());
      }
    };
  }
  if (!g.Response) {
    g.Response = class Response {
      constructor(body, init) {
        this.body = body;
        this.status = (init && init.status) || 200;
        this.headers = (init && init.headers) || new g.Headers();
      }
      static json(data, init) {
        return new g.Response(JSON.stringify(data), {
          ...(init || {}),
          headers: new g.Headers({
            'Content-Type': 'application/json',
            ...((init && init.headers) || {}),
          }),
        });
      }
      text() {
        return Promise.resolve(typeof this.body === 'string' ? this.body : '');
      }
      json() {
        try {
          return Promise.resolve(JSON.parse(this.body || '{}'));
        } catch {
          return Promise.resolve({});
        }
      }
    };
  }
})();

class NextRequest {
  constructor(input, init) {
    const g = globalThis;
    const base = g.location && g.location.origin ? g.location.origin : 'http://localhost:3000';
    const raw = typeof input === 'string' ? input : (input && input.url) || '';
    const url = new URL(raw, base).toString();
    const headers = new g.Headers(init && init.headers ? init.headers : {});
    const hasBody = init && typeof init.body !== 'undefined' && init.body !== null;
    if (hasBody && !headers.get('content-type')) headers.set('content-type', 'application/json');
    this.url = url;
    this.method = (init && init.method) || 'GET';
    this.headers = headers;
    this.nextUrl = new URL(url);
    this.cookies = new Map();
    const bodyVal = init ? init.body : undefined;
    if (typeof bodyVal === 'string') this._rawBody = bodyVal;
    else if (bodyVal && typeof bodyVal === 'object') {
      try {
        this._rawBody = JSON.stringify(bodyVal);
      } catch {
        this._rawBody = String(bodyVal);
      }
    }
  }
  json() {
    try {
      return Promise.resolve(this._rawBody ? JSON.parse(this._rawBody) : {});
    } catch {
      return Promise.resolve({});
    }
  }
  text() {
    return Promise.resolve(this._rawBody || '');
  }
  formData() {
    return Promise.resolve(new FormData());
  }
  clone() {
    return new NextRequest(this.url);
  }
}

const NextResponse = {
  json(data, init) {
    return new globalThis.Response(JSON.stringify(data), {
      ...(init || {}),
      headers: {
        'Content-Type': 'application/json',
        ...(init && init.headers ? init.headers : {}),
      },
    });
  },
  redirect(url, init) {
    const status = typeof init === 'number' ? init : (init && init.status) || 307;
    const headers = new globalThis.Headers();
    headers.set('Location', url.toString());
    return new globalThis.Response(null, { status, headers });
  },
  next(init) {
    return new globalThis.Response(null, { ...(init || {}), status: (init && init.status) || 200 });
  },
  rewrite(destination, init) {
    return new globalThis.Response(null, {
      ...(init || {}),
      headers: {
        'x-middleware-rewrite': destination.toString(),
        ...(init && init.headers ? init.headers : {}),
      },
    });
  },
  error() {
    return new globalThis.Response(null, { status: 500 });
  },
};

module.exports = { NextRequest, NextResponse, default: { NextRequest, NextResponse } };
