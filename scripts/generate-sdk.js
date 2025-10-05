#!/usr/bin/env node

/**
 * SIGMACODE AI API Client SDK Generator
 * Generates TypeScript client SDK from OpenAPI specification
 *
 * Usage: node scripts/generate-sdk.js [output-dir]
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = process.argv[2] || './lib/sdk';
const OPENAPI_PATH = './openapi-spec.yaml';

// Simple OpenAPI parser (in production, use a proper library like openapi-codegen)
function parseOpenAPI(specContent) {
  try {
    // This is a simplified parser. For production, use a proper OpenAPI parser
    const lines = specContent.split('\n');
    const paths = {};
    let currentPath = null;
    let currentMethod = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Parse paths
      if (trimmed.startsWith('/')) {
        currentPath = trimmed.split(':')[0];
        paths[currentPath] = {};
      }

      // Parse methods
      if (trimmed.match(/^\s*(get|post|put|delete|patch):\s*$/i)) {
        currentMethod = trimmed.split(':')[0].trim().toLowerCase();
        paths[currentPath][currentMethod] = {
          method: currentMethod.toUpperCase(),
          path: currentPath,
          parameters: [],
          responses: {},
        };
      }
    }

    return { paths };
  } catch (error) {
    console.error('Failed to parse OpenAPI spec:', error);
    return { paths: {} };
  }
}

function generateTypeScriptSDK(spec) {
  const { paths } = spec;

  let sdk = `/**
 * SIGMACODE AI API Client SDK
 * Auto-generated from OpenAPI specification
 *
 * Generated: ${new Date().toISOString()}
 */

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export class ApiClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(baseURL: string = '/api', headers: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers,
    };
  }

  private async request<T = any>(
    method: string,
    endpoint: string,
    options: {
      body?: any;
      headers?: Record<string, string>;
      params?: Record<string, string>;
    } = {}
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);

    // Add query parameters
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        ...this.headers,
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new ApiError({
        message: \`HTTP \${response.status}: \${response.statusText}\`,
        status: response.status,
      });
    }

    const data = await response.json();

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    };
  }

  // Generated API methods
`;

  // Generate methods for each endpoint
  Object.entries(paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, config]) => {
      const methodName = `${method}${path.replace(/[/{}]/g, '_').replace(/_+/g, '_').toLowerCase()}`;

      sdk += `
  async ${methodName}(options: {
    body?: any;
    headers?: Record<string, string>;
    params?: Record<string, string>;
  } = {}): Promise<ApiResponse> {
    return this.request('${method.toUpperCase()}', '${path}', options);
  }
`;
    });
  });

  sdk += `
}

export class ApiError extends Error {
  public status: number;
  public code?: string;

  constructor({ message, status, code }: { message: string; status: number; code?: string }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
`;

  return sdk;
}

async function main() {
  try {
    console.log('🚀 Generating API Client SDK...');

    // Read OpenAPI specification
    const specContent = fs.readFileSync(OPENAPI_PATH, 'utf-8');
    const spec = parseOpenAPI(specContent);

    // Generate TypeScript SDK
    const sdkContent = generateTypeScriptSDK(spec);

    // Ensure output directory exists
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Write SDK file
    const outputPath = path.join(OUTPUT_DIR, 'api-client.ts');
    fs.writeFileSync(outputPath, sdkContent);

    console.log('✅ API Client SDK generated successfully!');
    console.log(`📍 Output: ${outputPath}`);
    console.log(`🔧 Generated methods for ${Object.keys(spec.paths).length} endpoints`);

  } catch (error) {
    console.error('❌ Failed to generate SDK:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
