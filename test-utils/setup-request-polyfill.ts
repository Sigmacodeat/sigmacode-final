// Ensure Request/Response/Headers/fetch exist before any module mapping loads
// This runs in Jest setupFiles (earliest hook)

try {
  // Use undici for WHATWG Fetch primitives in Node
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Request, Response, Headers, fetch } = require('undici');
  const g: any = globalThis as any;
  if (typeof g.Request === 'undefined') g.Request = Request;
  if (typeof g.Response === 'undefined') g.Response = Response;
  if (typeof g.Headers === 'undefined') g.Headers = Headers;
  if (typeof g.fetch === 'undefined') g.fetch = fetch;
} catch {}

// TextEncoder/TextDecoder polyfill (some deps require it early)
try {
  const g: any = globalThis as any;
  if (typeof g.TextEncoder === 'undefined' || typeof g.TextDecoder === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { TextEncoder, TextDecoder } = require('util');
    if (typeof g.TextEncoder === 'undefined') g.TextEncoder = TextEncoder;
    if (typeof g.TextDecoder === 'undefined') g.TextDecoder = TextDecoder;
  }
} catch {}
