// /app/lib/circuit-breaker.ts
interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Number of successes to close
  timeout: number; // Time in ms to wait before half-open
  monitoringPeriod: number; // Time window in ms to track failures
}

interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  successes: number;
  lastFailureTime: number;
  lastSuccessTime: number;
}

export class CircuitBreaker {
  private state: CircuitBreakerState;
  private options: CircuitBreakerOptions;
  private name: string;

  constructor(name: string, options: Partial<CircuitBreakerOptions> = {}) {
    this.name = name;
    this.options = {
      failureThreshold: 5,
      successThreshold: 3,
      timeout: 60000, // 1 minute
      monitoringPeriod: 60000, // 1 minute
      ...options,
    };

    this.state = {
      state: 'closed',
      failures: 0,
      successes: 0,
      lastFailureTime: 0,
      lastSuccessTime: 0,
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state.state = 'half-open';
        this.state.successes = 0;
      } else {
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
    }

    try {
      const result = await operation();

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.state.lastFailureTime > this.options.timeout;
  }

  private onSuccess() {
    this.state.failures = 0;
    this.state.successes++;
    this.state.lastSuccessTime = Date.now();

    if (this.state.state === 'half-open' && this.state.successes >= this.options.successThreshold) {
      this.state.state = 'closed';
      this.state.successes = 0;
      console.log(`Circuit breaker ${this.name} closed`);
    }
  }

  private onFailure() {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();

    // Clean old failures outside monitoring period
    if (Date.now() - this.state.lastSuccessTime > this.options.monitoringPeriod) {
      this.state.failures = 1;
    }

    if (this.state.failures >= this.options.failureThreshold) {
      this.state.state = 'open';
      console.warn(`Circuit breaker ${this.name} opened after ${this.state.failures} failures`);
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  getMetrics(): {
    name: string;
    state: string;
    failures: number;
    successes: number;
    lastFailureTime: number;
    lastSuccessTime: number;
    uptime: number;
  } {
    return {
      name: this.name,
      state: this.state.state,
      failures: this.state.failures,
      successes: this.state.successes,
      lastFailureTime: this.state.lastFailureTime,
      lastSuccessTime: this.state.lastSuccessTime,
      uptime: Date.now() - Math.min(this.state.lastFailureTime, this.state.lastSuccessTime),
    };
  }
}

// Global circuit breaker registry
const circuitBreakers = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(
  name: string,
  options?: Partial<CircuitBreakerOptions>,
): CircuitBreaker {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, new CircuitBreaker(name, options));
  }
  return circuitBreakers.get(name)!;
}

// Pre-configured circuit breakers for common services
export const createServiceCircuitBreakers = () => {
  return {
    database: getCircuitBreaker('database', {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 30000,
    }),
    redis: getCircuitBreaker('redis', {
      failureThreshold: 5,
      successThreshold: 3,
      timeout: 60000,
    }),
    externalApi: getCircuitBreaker('external-api', {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 120000,
    }),
    sigmaguard: getCircuitBreaker('sigmaguard', {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 60000,
    }),
  };
};

// Health check function for all circuit breakers
export function getCircuitBreakerHealth() {
  const health: Record<string, any> = {};

  for (const [name, breaker] of circuitBreakers) {
    health[name] = breaker.getMetrics();
  }

  return health;
}
