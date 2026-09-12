import { describe, expect, it } from 'vitest';

import {
  buildSocialSharePayload,
  RETHRA_DESIGN_GITHUB_REPO_URL,
} from '../src/api/social-share';

describe('social-share contract', () => {
  it('builds RethraDesign repository share targets', () => {
    const payload = buildSocialSharePayload({
      kind: 'rethra-design-repo',
      locale: 'zh-CN',
      title: 'RethraDesign GitHub',
      text: '推荐 RethraDesign',
    });

    expect(payload.url).toBe(RETHRA_DESIGN_GITHUB_REPO_URL);
    expect(payload.locale).toBe('zh-CN');
    expect(payload.platforms.some((target) => target.platform === 'x' && target.shareUrl?.includes('twitter.com/intent/tweet'))).toBe(true);
    expect(payload.platforms.some((target) => target.platform === 'xiaohongshu' && target.mode === 'copy-open')).toBe(true);
  });

  it('keeps deployed project links and the repo recommendation together', () => {
    const payload = buildSocialSharePayload({
      kind: 'project-html',
      locale: 'en',
      url: 'https://example.com/rethra-design-demo',
      title: 'Demo',
      text: `Built with RethraDesign. Repo: ${RETHRA_DESIGN_GITHUB_REPO_URL}`,
      copyText: `Demo\nhttps://example.com/rethra-design-demo\n${RETHRA_DESIGN_GITHUB_REPO_URL}`,
    });

    expect(payload.url).toBe('https://example.com/rethra-design-demo');
    expect(payload.githubRepoUrl).toBe(RETHRA_DESIGN_GITHUB_REPO_URL);
    expect(payload.copyText).toContain(RETHRA_DESIGN_GITHUB_REPO_URL);
    expect(payload.platforms.find((target) => target.platform === 'telegram')?.shareUrl)
      .toContain('https%3A%2F%2Fexample.com%2Frethra-design-demo');
  });
});
