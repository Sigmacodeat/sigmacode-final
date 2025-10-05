#!/usr/bin/env node

// Test runner script for Firewall components
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class FirewallTestRunner {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      duration: 0,
      coverage: null,
    };

    this.testSuites = [
      'lib/__tests__/superagent-firewall.test.ts',
      'lib/__tests__/ml-threat-detector.test.ts',
      'lib/__tests__/ml-training-service.test.ts',
      'lib/__tests__/firewall-integration.test.ts',
      'lib/__tests__/firewall-performance.test.ts',
      'app/api/firewall/analyze/__tests__/route.test.ts',
      'app/api/firewall/stats/__tests__/route.test.ts',
      'app/api/firewall/logs/__tests__/route.test.ts',
    ];
  }

  async runAllTests() {
    console.log('🚀 Starting Firewall Test Suite...\n');

    const startTime = Date.now();

    try {
      // Run unit tests
      console.log('📋 Running Unit Tests...');
      await this.runJestTests(['--testPathPattern=lib/__tests__']);

      // Run API tests
      console.log('🔌 Running API Tests...');
      await this.runJestTests(['--testPathPattern=app/api']);

      // Run integration tests
      console.log('🔗 Running Integration Tests...');
      await this.runJestTests(['--testPathPattern=integration']);

      // Run performance tests
      console.log('⚡ Running Performance Tests...');
      await this.runJestTests(['--testPathPattern=performance']);

      // Generate coverage report
      console.log('📊 Generating Coverage Report...');
      await this.generateCoverageReport();

      // Run linting
      console.log('🔍 Running Linting...');
      await this.runLinting();

      this.testResults.duration = Date.now() - startTime;

      this.displayResults();
      this.generateReport();

      return this.testResults.failed === 0;
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    }
  }

  async runJestTests(additionalArgs = []) {
    const args = [
      '--config=jest.config.js',
      '--verbose',
      '--passWithNoTests',
      '--forceExit',
      ...additionalArgs,
    ];

    try {
      execSync(`npx jest ${args.join(' ')}`, {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
    } catch (error) {
      // Jest exits with code 1 when tests fail, which is expected
      if (error.status !== 1) {
        throw error;
      }
    }
  }

  async generateCoverageReport() {
    try {
      execSync('npx jest --coverage --coverageDirectory=coverage --passWithNoTests', {
        stdio: 'inherit',
        cwd: process.cwd(),
      });

      // Read coverage summary
      const coverageSummary = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));

      this.testResults.coverage = {
        lines: coverageSummary.total.lines.pct,
        functions: coverageSummary.total.functions.pct,
        branches: coverageSummary.total.branches.pct,
        statements: coverageSummary.total.statements.pct,
      };
    } catch (error) {
      console.warn('⚠️  Coverage report generation failed:', error.message);
    }
  }

  async runLinting() {
    try {
      execSync('npx eslint lib/ app/api/firewall/ --ext .ts,.tsx', {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
    } catch (error) {
      console.warn('⚠️  Linting found issues:', error.message);
    }
  }

  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 FIREWALL TEST RESULTS');
    console.log('='.repeat(60));

    console.log(`✅ Tests Passed: ${this.testResults.passed}`);
    console.log(`❌ Tests Failed: ${this.testResults.failed}`);
    console.log(`⏭️  Tests Skipped: ${this.testResults.skipped}`);
    console.log(`📈 Total Tests: ${this.testResults.total}`);

    if (this.testResults.coverage) {
      console.log('\n📊 COVERAGE REPORT');
      console.log('-'.repeat(30));
      console.log(`📏 Lines: ${this.testResults.coverage.lines.toFixed(1)}%`);
      console.log(`🔧 Functions: ${this.testResults.coverage.functions.toFixed(1)}%`);
      console.log(`🌿 Branches: ${this.testResults.coverage.branches.toFixed(1)}%`);
      console.log(`📝 Statements: ${this.testResults.coverage.statements.toFixed(1)}%`);
    }

    console.log(`\n⏱️  Total Duration: ${(this.testResults.duration / 1000).toFixed(2)}s`);

    console.log('='.repeat(60));

    if (this.testResults.failed > 0) {
      console.log('❌ SOME TESTS FAILED - Please review the output above');
      process.exit(1);
    } else {
      console.log('✅ ALL TESTS PASSED - Firewall system is ready!');
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.testResults,
      summary: {
        success: this.testResults.failed === 0,
        totalTests: this.testResults.total,
        passRate: ((this.testResults.passed / this.testResults.total) * 100).toFixed(1) + '%',
      },
      recommendations: this.generateRecommendations(),
    };

    // Save report to file
    const reportPath = 'test-results/firewall-test-report.json';
    fs.mkdirSync('test-results', { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📄 Test report saved to: ${reportPath}`);
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.testResults.coverage) {
      if (this.testResults.coverage.lines < 85) {
        recommendations.push('📈 Increase test coverage for better code quality');
      }

      if (this.testResults.coverage.branches < 80) {
        recommendations.push('🌿 Add more tests for conditional branches');
      }

      if (this.testResults.failed > 0) {
        recommendations.push('🔧 Fix failing tests to ensure system reliability');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All quality metrics are within acceptable ranges');
    }

    return recommendations;
  }

  async runSpecificTest(testFile) {
    console.log(`🎯 Running specific test: ${testFile}`);

    try {
      await this.runJestTests([testFile]);
      console.log(`✅ ${testFile} completed successfully`);
    } catch (error) {
      console.error(`❌ ${testFile} failed:`, error.message);
      throw error;
    }
  }

  async runTestsWithCoverage() {
    console.log('📊 Running tests with coverage analysis...');

    try {
      await this.generateCoverageReport();
      console.log('✅ Coverage analysis completed');
    } catch (error) {
      console.error('❌ Coverage analysis failed:', error.message);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const testRunner = new FirewallTestRunner();

  if (args.length === 0) {
    // Run all tests
    const success = await testRunner.runAllTests();
    process.exit(success ? 0 : 1);
  } else {
    // Handle specific commands
    const command = args[0];

    switch (command) {
      case 'coverage':
        await testRunner.runTestsWithCoverage();
        break;

      case 'specific':
        if (args[1]) {
          await testRunner.runSpecificTest(args[1]);
        } else {
          console.error('❌ Please specify a test file');
          process.exit(1);
        }
        break;

      case 'help':
        console.log(`
🔥 Firewall Test Runner Commands:

  npm run test:firewall    - Run all firewall tests
  npm run test:coverage    - Run tests with coverage
  npm run test:specific     - Run specific test file
  npm run test:performance - Run performance tests only
  npm run test:integration - Run integration tests only

Examples:
  npm run test:specific lib/__tests__/superagent-firewall.test.ts
  npm run test:coverage
        `);
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        console.error('Run "npm run test:help" for available commands');
        process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = FirewallTestRunner;
