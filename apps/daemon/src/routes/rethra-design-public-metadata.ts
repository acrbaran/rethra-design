import type { Express } from 'express';
import type {
  RethraDesignDiscordPresenceResponse,
  RethraDesignGithubLatestReleaseResponse,
  RethraDesignGithubRepoResponse,
} from '@rethra-design/contracts';
import type { RouteDeps } from '../server-context.js';
import {
  RETHRA_DESIGN_DISCORD_INVITE_URL,
  type RethraDesignPublicMetadataService,
} from '../services/rethra-design-public-metadata.js';

export interface RegisterRethraDesignPublicMetadataRoutesDeps extends RouteDeps<'http'> {
  rethraDesignPublicMetadata: RethraDesignPublicMetadataService;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function registerRethraDesignPublicMetadataRoutes(
  app: Express,
  ctx: RegisterRethraDesignPublicMetadataRoutesDeps,
): void {
  const { rethraDesignPublicMetadata } = ctx;

  app.get('/api/github/rethra-design', async (_req, res) => {
    try {
      const stats = await rethraDesignPublicMetadata.readGithubRepoStats();
      const payload: RethraDesignGithubRepoResponse = {
        repo: 'nexu-io/rethra-design',
        stargazers_count: stats.stargazersCount,
        fetchedAt: stats.fetchedAt,
        stale: stats.stale,
      };
      res.json(payload);
    } catch (error) {
      res.status(502).json({ error: errorMessage(error) });
    }
  });

  app.get('/api/github/rethra-design/releases/latest', async (_req, res) => {
    try {
      const release = await rethraDesignPublicMetadata.readLatestReleaseInfo();
      const payload: RethraDesignGithubLatestReleaseResponse = {
        repo: 'nexu-io/rethra-design',
        tag_name: release.tagName,
        html_url: release.htmlUrl,
        fetchedAt: release.fetchedAt,
        stale: release.stale,
      };
      res.json(payload);
    } catch (error) {
      res.status(502).json({ error: errorMessage(error) });
    }
  });

  app.get('/api/community/discord', async (_req, res) => {
    try {
      const presence = await rethraDesignPublicMetadata.readDiscordPresence();
      const payload: RethraDesignDiscordPresenceResponse = {
        inviteCode: 'mHAjSMV6gz',
        inviteUrl: RETHRA_DESIGN_DISCORD_INVITE_URL,
        onlineCount: presence.onlineCount,
        memberCount: presence.memberCount,
        fetchedAt: presence.fetchedAt,
        stale: presence.stale,
      };
      res.json(payload);
    } catch (error) {
      res.status(502).json({ error: errorMessage(error) });
    }
  });
}
