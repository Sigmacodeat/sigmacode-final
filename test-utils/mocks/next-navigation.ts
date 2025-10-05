// Mock für next/navigation
import { vi } from 'vitest';

export const useRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
  refresh: vi.fn(),
});

export const usePathname = () => '/';
export const useSearchParams = () => new URLSearchParams();
export const useParams = () => ({});

export const notFound = () => {
  const error = new Error('Not Found');
  // @ts-ignore - Add digest property
  error.digest = 'NEXT_NOT_FOUND';
  throw error;
};

export const redirect = (path: string) => {
  const error = new Error('Redirect');
  (error as any).digest = `NEXT_REDIRECT;${path}`;
  throw error;
};

export const permanentRedirect = redirect;

export const useSelectedLayoutSegment = () => null;
export const useSelectedLayoutSegments = () => [];

export default {
  useRouter,
  usePathname,
  useSearchParams,
  useParams,
  notFound,
  redirect,
  permanentRedirect,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
};
