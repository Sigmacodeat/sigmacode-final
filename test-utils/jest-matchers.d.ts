// test-utils/jest-matchers.d.ts
import '@jest/globals';

declare module '@jest/globals' {
  interface Matchers<R> {
    toBeValidAlert(): R;
    toHaveValidSeverity(): R;
    toBeWithinPerformanceBudget(budget: number): R;
    toHaveValidFirewallResponse(): R;
  }
}

export {};
