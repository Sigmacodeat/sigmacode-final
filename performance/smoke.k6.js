import http from 'k6/http';
import { check, sleep } from 'k6';

// Base URL comes from environment (GitHub Actions: set PERF_URL secret/variable)
const BASE_URL = __ENV.PERF_URL || '';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.05'], // <5% failures
  },
};

export default function () {
  if (!BASE_URL) {
    // No target configured -> soft no-op to allow CI to pass without configured env
    sleep(1);
    return;
  }
  // Health endpoint preferred, fallback to root
  const endpoints = [`${BASE_URL}/api/health`, `${BASE_URL}/`];

  for (const url of endpoints) {
    const res = http.get(url);
    check(res, {
      'status is 2xx/3xx': (r) => r.status >= 200 && r.status < 400,
    });
    sleep(0.5);
  }
}
