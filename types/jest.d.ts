// types/jest.d.ts
import 'jest';
import '@jest/globals';

declare module '@jest/globals' {
  interface Matchers<R> {
    toBeValidAlert(): R;
    toHaveValidSeverity(): R;
    toBeWithinPerformanceBudget(budget: number): R;
    toHaveValidFirewallResponse(): R;
  }
}
