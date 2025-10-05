#!/usr/bin/env node

/**
 * Advanced Test Runner for State-of-the-Art Testing
 * Supports parallel execution, different test types, and comprehensive reporting
 */

const { execSync, spawn } = require('child_process');
const { existsSync, mkdirSync } = require('fs');
const { join } = require('path');

class TestRunner {
  constructor() {
    this.projectRoot = process.cwd();
    this.testResultsDir = join(this.projectRoot, 'test-results');
    this.coverageDir = join(this.projectRoot, 'coverage');
    this.performanceReportsDir = join(this.projectRoot, 'performance-reports');

    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [this.testResultsDir, this.coverageDir, this.performanceReportsDir];
    dirs.forEach((dir) => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  runCommand(command, options = {}) {
    const { env = {}, ...otherOptions } = options;
    const fullEnv = { ...process.env, ...env };

    console.log(`🚀 Running: ${command}`);
    console.log('─'.repeat(50));

    try {
      execSync(command, {
        stdio: 'inherit',
        cwd: this.projectRoot,
        env: fullEnv,
        ...otherOptions,
      });
      console.log('✅ Command completed successfully\n');
    } catch (error) {
      console.error('❌ Command failed:', error.message);
      process.exit(1);
    }
  }

  async runParallel(commands, concurrency = 4) {
    const chunks = [];
    for (let i = 0; i < commands.length; i += concurrency) {
      chunks.push(commands.slice(i, i + concurrency));
    }

    for (const chunk of chunks) {
      console.log(`🔄 Running ${chunk.length} tests in parallel...`);
      await Promise.all(chunk.map((cmd) => this.runCommandAsync(cmd)));
      console.log('✅ Parallel batch completed\n');
    }
  }

  runCommandAsync(command) {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      const child = spawn(cmd, args, {
        stdio: 'pipe',
        cwd: this.projectRoot,
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        output += data.toString();
        process.stderr.write(data);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed with code ${code}: ${command}`));
        }
      });
    });
  }

  // Test Suites
  async runAllTests() {
    console.log('🎯 Running Complete Test Suite');
    console.log('='.repeat(60));

    const startTime = Date.now();

    try {
      // 1. Type checking
      console.log('\n📝 Step 1: TypeScript Type Checking');
      this.runCommand('npx tsc --noEmit --skipLibCheck');

      // 2. Linting
      console.log('\n🔍 Step 2: Code Linting');
      this.runCommand('npx eslint . --ext .ts,.tsx --max-warnings 0');

      // 3. Unit tests
      console.log('\n🧪 Step 3: Unit Tests');
      this.runCommand(
        'npx jest --config jest.config.ts --testPathPattern=".*\\.(unit|test)\\.ts$" --coverage',
      );

      // 4. Integration tests
      console.log('\n🔗 Step 4: Integration Tests');
      this.runCommand(
        'npx jest --config jest.config.ts --testPathPattern=".*integration.*\\.ts$" --coverage=false',
      );

      // 5. Property-based tests
      console.log('\n🔀 Step 5: Property-based Tests');
      this.runCommand(
        'npx jest --config jest.config.ts --testPathPattern=".*property.*\\.ts$" --coverage=false',
      );

      // 6. Performance tests
      console.log('\n⚡ Step 6: Performance Tests');
      this.runCommand(
        'npx jest --config jest.config.ts --testPathPattern=".*performance.*\\.ts$" --coverage=false',
      );

      // 7. Mutation tests (if available)
      console.log('\n🧬 Step 7: Mutation Tests');
      try {
        this.runCommand('npx stryker run --config stryker.config.json');
      } catch (error) {
        console.log('⚠️  Mutation testing not configured, skipping...');
      }

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      console.log('\n🎉 All Tests Completed Successfully!');
      console.log(`⏱️  Total execution time: ${duration.toFixed(2)} seconds`);
      console.log(`📊 Coverage reports: ${this.coverageDir}/lcov-report/index.html`);
      console.log(`📈 Performance reports: ${this.performanceReportsDir}`);
    } catch (error) {
      console.error('\n💥 Test Suite Failed!');
      console.error('Error:', error.message);
      process.exit(1);
    }
  }

  async runUnitTests() {
    console.log('🧪 Running Unit Tests Only');
    console.log('─'.repeat(40));

    const commands = [
      'npx jest --config jest.config.ts --testPathPattern=".*\\.(unit|test)\\.ts$" --coverage --verbose',
      'npx jest --config jest.config.ts --testPathPattern="app/api/alerts/__tests__/route\\.test\\.ts$" --verbose',
      'npx jest --config jest.config.ts --testPathPattern="app/api/firewall/.*\\.test\\.ts$" --verbose',
    ];

    await this.runParallel(commands, 2);
  }

  async runIntegrationTests() {
    console.log('🔗 Running Integration Tests');
    console.log('─'.repeat(40));

    this.runCommand(
      'npx jest --config jest.config.ts --testPathPattern=".*integration.*\\.ts$" --verbose --coverage=false',
    );
  }

  async runPerformanceTests() {
    console.log('⚡ Running Performance Tests');
    console.log('─'.repeat(40));

    this.runCommand(
      'npx jest --config jest.config.ts --testPathPattern=".*performance.*\\.ts$" --verbose --coverage=false',
    );
  }

  async runPropertyTests() {
    console.log('🔀 Running Property-based Tests');
    console.log('─'.repeat(40));

    this.runCommand(
      'npx jest --config jest.config.ts --testPathPattern=".*property.*\\.ts$" --verbose --coverage=false',
    );
  }

  async runAlertTests() {
    console.log('🚨 Running Alert API Tests');
    console.log('─'.repeat(40));

    const commands = [
      'npx jest --config jest.config.ts app/api/alerts/__tests__/route.test.ts --verbose',
      'npx jest --config jest.config.ts app/api/alerts/__tests__/route.comprehensive.test.ts --verbose',
      'npx jest --config jest.config.ts app/api/alerts/__tests__/route.property.test.ts --verbose',
      'npx jest --config jest.config.ts app/api/alerts/__tests__/integration.test.ts --verbose',
      'npx jest --config jest.config.ts app/api/alerts/__tests__/statistics.test.ts --verbose',
      'npx jest --config jest.config.ts app/api/alerts/__tests__/actions.test.ts --verbose',
    ];

    await this.runParallel(commands, 3);
  }

  async runFirewallTests() {
    console.log('🛡️  Running Firewall Tests');
    console.log('─'.repeat(40));

    const commands = [
      'npx jest --config jest.config.ts app/api/firewall/firewall-performance.test.ts --verbose',
      'npx jest --config jest.config.ts app/api/firewall/analyze/__tests__/route.test.ts --verbose',
      'npx jest --config jest.config.ts app/api/firewall/config/__tests__/route.test.ts --verbose',
      'npx jest --config jest.config.ts app/api/firewall/events/__tests__/route.test.ts --verbose',
    ];

    await this.runParallel(commands, 2);
  }

  async runCoverageReport() {
    console.log('📊 Generating Coverage Report');
    console.log('─'.repeat(40));

    this.runCommand(
      'npx jest --config jest.config.ts --coverage --coverageReporters=html --coverageDirectory=coverage',
    );
    console.log(`📈 Coverage report generated: ${this.coverageDir}/lcov-report/index.html`);
  }

  async runBenchmarks() {
    console.log('📈 Running Benchmarks');
    console.log('─'.repeat(40));

    this.runCommand(
      'npx jest --config jest.config.ts --testPathPattern=".*benchmark.*\\.ts$" --verbose --coverage=false',
    );
  }

  async runLoadTests() {
    console.log('🔥 Running Load Tests');
    console.log('─'.repeat(40));

    // Using autocannon for HTTP load testing
    try {
      this.runCommand(
        'npx autocannon -c 100 -d 30 http://localhost:3000/api/alerts/statistics?tenantId=test-tenant',
      );
    } catch (error) {
      console.log('⚠️  Load testing requires server to be running on port 3000');
    }
  }

  async runSecurityTests() {
    console.log('🔒 Running Security Tests');
    console.log('─'.repeat(40));

    const commands = [
      'npx jest --config jest.config.ts --testNamePattern="security" --verbose',
      'npx snyk test --json --out=snyk-results.json',
      'npx audit --audit-level=moderate --json --out=audit-results.json',
    ];

    await this.runParallel(commands, 2);
  }

  async runWatchMode() {
    console.log('👀 Running Tests in Watch Mode');
    console.log('─'.repeat(40));

    this.runCommand('npx jest --config jest.config.ts --watch --verbose');
  }

  async runSpecificTest(filePath) {
    console.log(`🎯 Running Specific Test: ${filePath}`);
    console.log('─'.repeat(40));

    this.runCommand(`npx jest --config jest.config.ts ${filePath} --verbose`);
  }

  async runWithCoverage() {
    console.log('📊 Running Tests with Coverage');
    console.log('─'.repeat(40));

    this.runCommand(
      'npx jest --config jest.config.ts --coverage --coverageReporters=text --coverageReporters=lcov --coverageReporters=json-summary',
    );
  }

  // CI/CD Pipeline Methods
  async runCIPipeline() {
    console.log('🚀 Running CI Pipeline');
    console.log('='.repeat(50));

    const startTime = Date.now();

    try {
      // Parallel execution of critical tests
      const criticalTests = [
        'npx jest --config jest.config.ts app/api/alerts/__tests__/route.comprehensive.test.ts --coverage=false',
        'npx jest --config jest.config.ts app/api/firewall/firewall-performance.test.ts --coverage=false',
        'npx jest --config jest.config.ts app/api/alerts/__tests__/integration.test.ts --coverage=false',
      ];

      await this.runParallel(criticalTests, 2);

      // Type checking and linting
      this.runCommand('npx tsc --noEmit --skipLibCheck');
      this.runCommand('npx eslint . --ext .ts,.tsx --max-warnings 0');

      // Generate coverage report
      this.runCommand(
        'npx jest --config jest.config.ts --coverage --coverageReporters=lcov --coverageDirectory=coverage',
      );

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      console.log('\n✅ CI Pipeline Completed Successfully!');
      console.log(`⏱️  Total execution time: ${duration.toFixed(2)} seconds`);
    } catch (error) {
      console.error('\n💥 CI Pipeline Failed!');
      console.error('Error:', error.message);
      process.exit(1);
    }
  }

  async runCDPipeline() {
    console.log('🚀 Running CD Pipeline');
    console.log('='.repeat(50));

    // This would typically run in a deployment environment
    console.log('🔍 Production Deployment Tests');
    console.log('📦 Building production bundle...');
    console.log('🔬 Running smoke tests...');
    console.log('📊 Running health checks...');

    // Placeholder for actual CD pipeline
    console.log('✅ CD Pipeline completed (placeholder)');
  }

  // Utility Methods
  showHelp() {
    console.log(`
🔧 Advanced Test Runner

Usage: node test-runner.js [command]

Commands:
  all              Run complete test suite
  unit             Run unit tests only
  integration      Run integration tests only
  performance      Run performance tests only
  property         Run property-based tests only
  alerts           Run alert API tests
  firewall         Run firewall tests
  coverage         Generate coverage report
  benchmarks       Run benchmark tests
  load             Run load tests
  security         Run security tests
  watch            Run tests in watch mode
  specific <path>  Run specific test file
  with-coverage    Run tests with coverage
  ci               Run CI pipeline
  cd               Run CD pipeline

Examples:
  node test-runner.js all
  node test-runner.js unit
  node test-runner.js specific app/api/alerts/__tests__/route.test.ts
  node test-runner.js ci
    `);
  }

  // Main execution
  async main() {
    const command = process.argv[2];
    const args = process.argv.slice(3);

    switch (command) {
      case 'all':
        await this.runAllTests();
        break;
      case 'unit':
        await this.runUnitTests();
        break;
      case 'integration':
        await this.runIntegrationTests();
        break;
      case 'performance':
        await this.runPerformanceTests();
        break;
      case 'property':
        await this.runPropertyTests();
        break;
      case 'alerts':
        await this.runAlertTests();
        break;
      case 'firewall':
        await this.runFirewallTests();
        break;
      case 'coverage':
        await this.runCoverageReport();
        break;
      case 'benchmarks':
        await this.runBenchmarks();
        break;
      case 'load':
        await this.runLoadTests();
        break;
      case 'security':
        await this.runSecurityTests();
        break;
      case 'watch':
        await this.runWatchMode();
        break;
      case 'specific':
        if (args[0]) {
          await this.runSpecificTest(args[0]);
        } else {
          console.error('❌ Please provide a test file path');
          this.showHelp();
        }
        break;
      case 'with-coverage':
        await this.runWithCoverage();
        break;
      case 'ci':
        await this.runCIPipeline();
        break;
      case 'cd':
        await this.runCDPipeline();
        break;
      default:
        this.showHelp();
        break;
    }
  }
}

// Run the test runner
if (require.main === module) {
  const runner = new TestRunner();
  runner.main().catch(console.error);
}

module.exports = TestRunner;
