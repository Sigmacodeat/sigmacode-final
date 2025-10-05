/* eslint-disable @typescript-eslint/no-var-requires */
// Ensure fetch primitives exist before anything else
const g: any = globalThis as any;

if (!g.Request || !g.Response || !g.Headers || !g.fetch) {
  try {
    const { Request, Response, Headers, fetch } = require('undici');
    if (!g.Request) g.Request = Request;
    if (!g.Response) g.Response = Response;
    if (!g.Headers) g.Headers = Headers;
    if (!g.fetch) g.fetch = fetch;
  } catch (e) {
    console.warn('Failed to load undici for Request/Response polyfill', e);
  }
}

// Simple Request mock if still not available
if (!g.Request) {
  g.Request = class Request {
    method: string;
    url: string;
    headers: any;
    constructor(input: string | URL | Request, init?: RequestInit) {
      const rawUrl =
        typeof input === 'string'
          ? input.startsWith('/')
            ? `http://localhost:3000${input}`
            : input
          : input.toString();

      this.url = rawUrl;
      this.method = (init?.method || 'GET').toUpperCase();
      this.headers = new Headers(init?.headers);
    }
  };
}

export class NextRequest extends Request {
  public nextUrl: URL;
  public cookies: Map<string, string> = new Map();
  public headers: Headers;

  constructor(input: RequestInfo | URL, init?: RequestInit) {
    const url =
      typeof input === 'string'
        ? input.startsWith('/')
          ? `http://localhost:3000${input}`
          : input
        : input instanceof URL
          ? input.toString()
          : (input as any)?.url || 'http://localhost:3000';

    super(url, init);
    this.nextUrl = new URL(url);
    this.headers = new Headers(init?.headers);

    // Parse cookies
    const cookieHeader = this.headers.get('cookie') || '';
    cookieHeader.split(';').forEach((cookie: string) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) this.cookies.set(name, value);
    });
  }
}

// Minimaler NextResponse-Mock mit json-Helfer
export class NextResponse extends Response {
  static json(data: any, init?: ResponseInit) {
    const body = JSON.stringify(data ?? {});
    const headers = new Headers(init?.headers || {});
    if (!headers.has('content-type')) headers.set('content-type', 'application/json');
    return new NextResponse(body, { ...init, headers });
  }
}

// Export other commonly used server components
export * from './next-headers';
export * from './next-cache';

// Mock for server-only APIs
export const unstable_cache = <A extends unknown[], R>(fn: (...args: A) => R) => fn;
export const revalidatePath = () => {};
export const revalidateTag = () => {};
