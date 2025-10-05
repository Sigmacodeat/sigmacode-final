// test-utils/jest-matchers.ts
interface CustomMatchers<T = any> {
  toBeValidAlert(received: any): T;
  toHaveValidSeverity(received: string): T;
  toBeWithinPerformanceBudget(received: number, budget: number): T;
  toHaveValidFirewallResponse(received: any): T;
}

const CustomMatchers: CustomMatchers = {
  toBeValidAlert(received: any) {
    const requiredFields = ['id', 'title', 'message', 'severity', 'category', 'status', 'tenantId'];
    const hasRequiredFields = requiredFields.every((field) => received.hasOwnProperty(field));

    if (hasRequiredFields) {
      return {
        message: () => `expected alert to have fields: ${requiredFields.join(', ')}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected alert to have fields: ${requiredFields.join(', ')}`,
        pass: false,
      };
    }
  },

  toHaveValidSeverity(received: string) {
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    const pass = validSeverities.includes(received.toLowerCase());

    if (pass) {
      return {
        message: () => `expected ${received} to be a valid severity level`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of: ${validSeverities.join(', ')}`,
        pass: false,
      };
    }
  },

  toBeWithinPerformanceBudget(received: number, budget: number) {
    const pass = received <= budget;

    if (pass) {
      return {
        message: () => `expected ${received}ms to be within budget of ${budget}ms`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received}ms to be within budget of ${budget}ms`,
        pass: false,
      };
    }
  },

  toHaveValidFirewallResponse(received: any) {
    const requiredFields = ['id', 'timestamp', 'content', 'blocked', 'riskScore'];
    const hasRequiredFields = requiredFields.every((field) => received.hasOwnProperty(field));

    if (
      hasRequiredFields &&
      typeof received.blocked === 'boolean' &&
      typeof received.riskScore === 'number'
    ) {
      return {
        message: () => `expected valid firewall response with fields: ${requiredFields.join(', ')}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected valid firewall response with fields: ${requiredFields.join(', ')}`,
        pass: false,
      };
    }
  },
};

export { CustomMatchers };
