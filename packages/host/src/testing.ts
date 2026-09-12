import {
  RETHRA_DESIGN_HOST_GLOBAL,
  RETHRA_DESIGN_HOST_VERSION,
  type RethraDesignHostBridge,
  type RethraDesignHostGlobalScope,
  type RethraDesignHostUpdaterStatusSnapshot,
} from "./index.js";

export type MockRethraDesignHost = Partial<Omit<RethraDesignHostBridge, "capture" | "client" | "pdf" | "pet" | "preview" | "project" | "shell" | "updater">> & {
  browser?: Partial<RethraDesignHostBridge["browser"]>;
  capture?: Partial<RethraDesignHostBridge["capture"]>;
  client?: Partial<RethraDesignHostBridge["client"]>;
  pdf?: Partial<RethraDesignHostBridge["pdf"]>;
  pet?: Partial<RethraDesignHostBridge["pet"]>;
  preview?: Partial<NonNullable<RethraDesignHostBridge["preview"]>>;
  project?: Partial<RethraDesignHostBridge["project"]>;
  shell?: Partial<RethraDesignHostBridge["shell"]>;
  updater?: Partial<RethraDesignHostBridge["updater"]>;
};

export type MockRethraDesignHostOptions = {
  host?: MockRethraDesignHost;
  scope?: RethraDesignHostGlobalScope;
};

function defaultHost(): RethraDesignHostBridge {
  const updaterStatus: RethraDesignHostUpdaterStatusSnapshot = {
    arch: "arm64",
    capabilities: {
      canApplyInPlace: false,
      canDownload: true,
      canOpenInstaller: true,
      requiresManualInstall: true,
    },
    channel: "beta",
    currentVersion: "1.0.0-beta.0",
    enabled: true,
    mode: "package-launcher",
    platform: "darwin",
    state: "idle",
    supported: true,
  };
  return {
    version: RETHRA_DESIGN_HOST_VERSION,
    browser: {
      clearData: async () => ({ ok: true }),
    },
    capture: {
      page: async () => ({ ok: true, dataUrl: "data:image/png;base64,", h: 1, w: 1 }),
    },
    client: {
      type: "desktop",
      platform: "test",
    },
    shell: {
      openExternal: async () => ({ ok: true }),
      openPath: async () => ({ ok: true }),
    },
    project: {
      pickAndImport: async () => ({
        ok: true,
        projectId: "project-test",
        conversationId: "conversation-test",
        entryFile: "index.html",
      }),
      pickAndReplaceWorkingDir: async () => ({
        ok: true,
        baseDir: "/tmp/rethra-design-test",
        entryFile: null,
      }),
    },
    pdf: {
      print: async () => ({ ok: true }),
    },
    pet: {
      setVisible: () => undefined,
    },
    preview: {
      getLatestNavigationFailure: () => null,
      subscribeNavigationFailure: () => () => undefined,
    },
    updater: {
      check: async () => updaterStatus,
      "clear-cache": async () => updaterStatus,
      download: async () => updaterStatus,
      install: async () => updaterStatus,
      quit: async () => ({ ok: true }),
      setMenuLabels: async () => ({ ok: true }),
      status: async () => updaterStatus,
      subscribe: () => () => undefined,
      subscribeOpenDialog: () => () => undefined,
    },
  };
}

export function createMockRethraDesignHost(overrides: MockRethraDesignHost = {}): RethraDesignHostBridge {
  const base = defaultHost();
  return {
    ...base,
    ...overrides,
    browser: { ...base.browser, ...overrides.browser },
    capture: { ...base.capture, ...overrides.capture },
    client: { ...base.client, ...overrides.client },
    shell: { ...base.shell, ...overrides.shell },
    project: { ...base.project, ...overrides.project },
    pdf: { ...base.pdf, ...overrides.pdf },
    pet: { ...base.pet, ...overrides.pet },
    preview: {
      getLatestNavigationFailure:
        overrides.preview?.getLatestNavigationFailure
        ?? base.preview!.getLatestNavigationFailure,
      subscribeNavigationFailure:
        overrides.preview?.subscribeNavigationFailure
        ?? base.preview!.subscribeNavigationFailure,
    },
    updater: { ...base.updater, ...overrides.updater },
  };
}

export function installMockRethraDesignHost(options: MockRethraDesignHostOptions = {}): () => void {
  const scope = (options.scope ?? globalThis) as RethraDesignHostGlobalScope;
  const host = createMockRethraDesignHost(options.host);
  const windowValue = scope.window;
  const targets = [
    scope,
    ...(typeof windowValue === "object" && windowValue != null && windowValue !== scope
      ? [windowValue as RethraDesignHostGlobalScope]
      : []),
  ];
  const previous = targets.map((target) => ({
    had: Object.prototype.hasOwnProperty.call(target, RETHRA_DESIGN_HOST_GLOBAL),
    target,
    value: target[RETHRA_DESIGN_HOST_GLOBAL],
  }));

  for (const target of targets) {
    Object.defineProperty(target, RETHRA_DESIGN_HOST_GLOBAL, {
      configurable: true,
      value: host,
      writable: true,
    });
  }

  return () => {
    for (const entry of previous) {
      if (entry.had) {
        Object.defineProperty(entry.target, RETHRA_DESIGN_HOST_GLOBAL, {
          configurable: true,
          value: entry.value,
          writable: true,
        });
      } else {
        delete entry.target[RETHRA_DESIGN_HOST_GLOBAL];
      }
    }
  };
}
