import { describe, it, expect } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Alert Rules API Routes - Basic Test', () => {
  it('should have the route file in the correct location', () => {
    const routePath = join(__dirname, '../rules/route.ts');
    expect(existsSync(routePath)).toBe(true);

    // Read the file to verify it contains the expected exports
    const fileContent = readFileSync(routePath, 'utf8');
    expect(fileContent).toContain('export async function GET');
    expect(fileContent).toContain('export async function POST');
    expect(fileContent).toContain('export async function PUT');
    expect(fileContent).toContain('export async function DELETE');

    // Verify the file is not empty
    expect(fileContent.length).toBeGreaterThan(100);
  });
});
