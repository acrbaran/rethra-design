import { describe, expect, it } from 'vitest';

import { userFacingAgentLabel } from '../src/user-facing-agent-label.js';

describe('userFacingAgentLabel', () => {
  it('prefers the configured agent id over the resolved executable path', () => {
    expect(
      userFacingAgentLabel(
        'claude',
        '/Applications/Rethra Design Beta.app/Contents/Resources/rethra-design/bin/claude',
      ),
    ).toBe('claude');
  });

  it('falls back to the executable basename when agent id is missing', () => {
    expect(
      userFacingAgentLabel(
        null,
        '/Applications/Rethra Design Beta.app/Contents/Resources/rethra-design/bin/vela',
      ),
    ).toBe('vela');
  });

  it('strips Windows executable extensions from basename fallbacks', () => {
    expect(
      userFacingAgentLabel(
        '',
        'C:\\Program Files\\Rethra Design\\resources\\rethra-design\\bin\\unknown.exe',
      ),
    ).toBe('unknown');
  });

  it('returns a generic label when neither agent id nor path is available', () => {
    expect(userFacingAgentLabel(undefined, null)).toBe('agent');
  });
});
