// Mock für next/headers
const headers = new Map<string, string>();
const cookies = new Map<string, string>();

export const headersInstance = {
  get: (name: string) => headers.get(name.toLowerCase()),
  set: (name: string, value: string) => {
    headers.set(name.toLowerCase(), value);
  },
  has: (name: string) => headers.has(name.toLowerCase()),
  delete: (name: string) => {
    headers.delete(name.toLowerCase());
  },
  forEach: (callback: (value: string, key: string) => void) => {
    headers.forEach((value, key) => callback(value, key));
  },
  [Symbol.iterator]: () => headers[Symbol.iterator](),
  entries: () => headers.entries(),
  keys: () => headers.keys(),
  values: () => headers.values(),
  append: (name: string, value: string) => {
    const current = headers.get(name.toLowerCase()) || '';
    headers.set(name.toLowerCase(), current ? `${current}, ${value}` : value);
  },
};

export const cookiesInstance = {
  get: (name: string) => ({
    name,
    value: cookies.get(name) || '',
  }),
  set: (name: string, value: string) => {
    cookies.set(name, value);
  },
  has: (name: string) => cookies.has(name),
  delete: (name: string) => {
    cookies.delete(name);
  },
  getAll: () => {
    return Array.from(cookies.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  },
};

export const headersMock = {
  ...headersInstance,
  cookies: cookiesInstance,
};

export const headersFn = jest.fn(() => headersMock);
export const cookiesFn = jest.fn(() => cookiesInstance);

export const resetMocks = () => {
  headers.clear();
  cookies.clear();
  headersFn.mockClear();
  cookiesFn.mockClear();
};

export default {
  headers: headersFn,
  cookies: cookiesFn,
  // Test utilities
  resetMocks,
  _headers: headers,
  _cookies: cookies,
};
