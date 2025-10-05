import { AlertFactory, AlertManager, type Alert } from '../../../lib/alert-system';

/**
 * Tests for AlertManager.getFieldValue
 */

describe('AlertManager.getFieldValue', () => {
  const manager = new (AlertManager as any)(); // access private via any to call private method indirectly
  // We will call getFieldValue via bracket access to avoid TS private restriction in tests
  const getFieldValue: (field: string, alert: Alert) => any = (manager as any).getFieldValue.bind(
    manager,
  );

  const baseAlert: Alert = AlertFactory.createSecurityAlert(
    'Test Title',
    'Test message',
    {
      correlationId: 'cid-123',
      count: 0,
      empty: '',
      nested: { x: 1 },
    },
    'high',
    {
      requestId: 'rid-456',
      userId: 'u-1',
    },
  );

  it('returns top-level severity/type/source/userId', () => {
    expect(getFieldValue('severity', baseAlert)).toBe('high');
    expect(getFieldValue('type', baseAlert)).toBe('security');
    expect(getFieldValue('source', baseAlert)).toBe('sigmacode-ai-firewall');
    expect(getFieldValue('userId', baseAlert)).toBe('u-1');
  });

  it('resolves dot-notation for metadata.* and data.*', () => {
    expect(getFieldValue('metadata.requestId', baseAlert)).toBe('rid-456');
    expect(getFieldValue('data.correlationId', baseAlert)).toBe('cid-123');
  });

  it('falls back to data[field] then metadata[field] when no dot-notation is used', () => {
    // correlationId exists in data
    expect(getFieldValue('correlationId', baseAlert)).toBe('cid-123');

    // priority exists in metadata
    expect(getFieldValue('priority', baseAlert)).toBe(2); // high -> 2 per factory
  });

  it('does not override falsy values like 0 or empty string', () => {
    expect(getFieldValue('count', baseAlert)).toBe(0);
    expect(getFieldValue('empty', baseAlert)).toBe('');
  });

  it('returns undefined for unknown fields', () => {
    expect(getFieldValue('doesNotExist', baseAlert)).toBeUndefined();
  });
});
