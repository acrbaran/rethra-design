import { describe, expect, it } from 'vitest';

import {
  normalizeRethraDesignTelemetryRelayUrl,
  RETHRA_DESIGN_TELEMETRY_RELAY_URLS,
} from '../../src/integrations/telemetry-relay.js';

describe('RethraDesign telemetry relay URLs', () => {
  it('keeps production on telemetry.rethra-design.invalid', () => {
    expect(RETHRA_DESIGN_TELEMETRY_RELAY_URLS.prod).toBe(
      'https://telemetry.rethra-design.invalid/api/langfuse',
    );
    expect(normalizeRethraDesignTelemetryRelayUrl(
      'https://telemetry.rethra-design.invalid/api/langfuse//',
    )).toBe(RETHRA_DESIGN_TELEMETRY_RELAY_URLS.prod);
  });

  it('moves legacy self-host test URLs to telemetry-test.rethra-design.invalid', () => {
    expect(normalizeRethraDesignTelemetryRelayUrl(
      'https://telemetry-selfhost.rethra-design.invalid/api/langfuse/',
    )).toBe(RETHRA_DESIGN_TELEMETRY_RELAY_URLS.test);
  });

  it('leaves custom relay URLs unchanged', () => {
    expect(normalizeRethraDesignTelemetryRelayUrl(
      'https://telemetry.example.test/api/langfuse/',
    )).toBe('https://telemetry.example.test/api/langfuse');
  });
});
