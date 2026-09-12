import type { ReleaseChannel } from "@rethra-design/release";

/**
 * @module protocol
 *
 * The RethraDesign renderer host-bridge wire contract: the injected-global name
 * and version, client/updater constant registries, and every request/result
 * type that crosses the host bridge — including the {@link RethraDesignHostBridge}
 * shape itself. Pure declarations only; depends on nothing else in the package.
 */

export const RETHRA_DESIGN_HOST_GLOBAL = "__od__";
export const RETHRA_DESIGN_HOST_VERSION = 2;

export const RETHRA_DESIGN_HOST_CLIENT_TYPES = Object.freeze({
  DESKTOP: "desktop",
} as const);

export type RethraDesignHostClientType =
  (typeof RETHRA_DESIGN_HOST_CLIENT_TYPES)[keyof typeof RETHRA_DESIGN_HOST_CLIENT_TYPES];

export type RethraDesignHostClient = {
  // BCP-47 locale string (e.g. "zh-CN", "pt-BR") the host process read from
  // the OS at startup. The renderer uses this so the packaged desktop app
  // can follow the OS language even when Chromium's built-in
  // `navigator.language` would have defaulted to en-US.
  osLocale?: string;
  platform?: string;
  type: RethraDesignHostClientType;
};

export type RethraDesignHostFailure = {
  details?: unknown;
  ok: false;
  reason: string;
};

export type RethraDesignHostActionResult =
  | { ok: true }
  | RethraDesignHostFailure;

/**
 * The workspace attribution the renderer gives the host so a folder import
 * lands in the caller's current workspace instead of the host's ambient one.
 *
 * This is a deliberate structural subset of the daemon/web
 * `WorkspaceCollabContext`, redeclared here rather than imported: this package
 * is the renderer host-bridge wire contract and must stay independent of the
 * daemon/web contracts package (enforced by the "stays independent from
 * daemon/web contracts" test). A full `WorkspaceCollabContext` is structurally
 * assignable to this type, so callers pass theirs unchanged.
 *
 * Only the fields the host actually forwards are modelled, and the enum-like
 * fields stay `string` because the host treats them as opaque pass-through
 * values — the daemon remains the authority that parses and validates them.
 * Deliberately no index signature: an interface never satisfies one, so adding
 * it would reject the very `WorkspaceCollabContext` callers pass. Callers hand
 * over a variable, not a fresh literal, so the extra fields ride along fine.
 */
export type RethraDesignHostWorkspaceContext = {
  lifecycleState: string;
  memberStatus: string;
  permissions: {
    canShareProjects: boolean;
    canWriteSyncedFiles: boolean;
  };
  role: string;
  workspaceId: string;
  workspaceMemberId: string;
  workspaceType: string;
};

export type RethraDesignHostProjectImportInit = {
  designSystemId?: string | null;
  name?: string;
  skillId?: string | null;
  workspaceContext?: RethraDesignHostWorkspaceContext | null;
};

export type RethraDesignHostProjectImportSuccess = {
  conversationId: string;
  entryFile: string | null;
  ok: true;
  projectId: string;
};

export type RethraDesignHostProjectImportResult =
  | RethraDesignHostProjectImportSuccess
  | {
      canceled: true;
      ok: false;
    }
  | RethraDesignHostFailure;

export type RethraDesignHostProjectReplaceWorkingDirSuccess = {
  baseDir: string;
  entryFile: string | null;
  ok: true;
};

export type RethraDesignHostProjectReplaceWorkingDirResult =
  | RethraDesignHostProjectReplaceWorkingDirSuccess
  | {
      canceled: true;
      ok: false;
    }
  | RethraDesignHostFailure;

export type RethraDesignHostPickWorkingDirSuccess = {
  baseDir: string;
  ok: true;
  // Single-use HMAC token (minted by the host main process for `baseDir`)
  // that the renderer threads into POST /api/projects/:id/working-dir once
  // the project exists. Lets the Home flow pick a folder before the project
  // is created without exposing the daemon's desktop-auth gate.
  token: string;
};

export type RethraDesignHostPickWorkingDirResult =
  | RethraDesignHostPickWorkingDirSuccess
  | {
      canceled: true;
      ok: false;
    }
  | RethraDesignHostFailure;

export type RethraDesignHostPdfPrintOptions = {
  deck?: boolean;
};

export type RethraDesignHostCaptureClip = { x: number; y: number; width: number; height: number };
export type RethraDesignHostCaptureOptions = { clip?: RethraDesignHostCaptureClip };
export type RethraDesignHostCaptureSuccess = { dataUrl: string; h: number; ok: true; w: number };
export type RethraDesignHostCaptureResult = RethraDesignHostCaptureSuccess | RethraDesignHostFailure;

export type RethraDesignHostPreviewNavigationFailure = {
  errorCode: number;
  eventId: number;
  frameName?: string;
  occurredAtMs: number;
  validatedUrl: string;
};

export type RethraDesignHostPreviewNavigationFailureListener = (
  failure: RethraDesignHostPreviewNavigationFailure,
) => void;

export type RethraDesignHostBrowserClearDataOptions = {
  cookies?: boolean;
  storage?: boolean;
};

/**
 * App theme values the renderer may pin the host window appearance to.
 * `light`/`dark` force the native window material (macOS under-window
 * vibrancy glass follows the OS appearance by default, which reads as a
 * muddy gray when the OS is dark but the app theme is explicitly light);
 * `system` restores following the OS.
 */
export const RETHRA_DESIGN_HOST_APPEARANCE_THEMES = Object.freeze({
  DARK: "dark",
  LIGHT: "light",
  SYSTEM: "system",
} as const);

export type RethraDesignHostAppearanceTheme =
  (typeof RETHRA_DESIGN_HOST_APPEARANCE_THEMES)[keyof typeof RETHRA_DESIGN_HOST_APPEARANCE_THEMES];

export const RETHRA_DESIGN_HOST_UPDATER_ACTIONS = Object.freeze({
  CHECK: "check",
  CLEAR_CACHE: "clear-cache",
  DOWNLOAD: "download",
  INSTALL: "install",
  QUIT: "quit",
  STATUS: "status",
} as const);

export type RethraDesignHostUpdaterAction =
  (typeof RETHRA_DESIGN_HOST_UPDATER_ACTIONS)[keyof typeof RETHRA_DESIGN_HOST_UPDATER_ACTIONS];

/** @internal Updater actions that return a status snapshot (every action except `quit`). */
export type RethraDesignHostUpdaterStatusAction = Exclude<
  RethraDesignHostUpdaterAction,
  typeof RETHRA_DESIGN_HOST_UPDATER_ACTIONS.QUIT
>;

export const RETHRA_DESIGN_HOST_UPDATER_STATES = Object.freeze({
  AVAILABLE: "available",
  CHECKING: "checking",
  DOWNLOADED: "downloaded",
  DOWNLOADING: "downloading",
  ERROR: "error",
  IDLE: "idle",
  INSTALLING: "installing",
  NOT_AVAILABLE: "not-available",
  UNSUPPORTED: "unsupported",
} as const);

export type RethraDesignHostUpdaterState =
  (typeof RETHRA_DESIGN_HOST_UPDATER_STATES)[keyof typeof RETHRA_DESIGN_HOST_UPDATER_STATES];

export type RethraDesignHostUpdaterMode = "js-incremental" | "package-launcher";
export type RethraDesignHostUpdaterChannel = ReleaseChannel;

export type RethraDesignHostUpdaterActionOptions = {
  payload?: Record<string, unknown>;
};

export type RethraDesignHostUpdaterCapabilitySet = {
  canApplyInPlace: boolean;
  canDownload: boolean;
  canOpenInstaller: boolean;
  requiresManualInstall: boolean;
};

export type RethraDesignHostUpdaterPathSnapshot = {
  downloadRoot?: string;
  manifestPath?: string;
};

export type RethraDesignHostUpdaterChecksumSnapshot = {
  algorithm: "sha256" | "sha512";
  url?: string;
  value?: string;
};

export type RethraDesignHostUpdaterArtifactSnapshot = {
  name?: string;
  platformKey?: string;
  size?: number;
  type?: string;
  url: string;
};

export type RethraDesignHostUpdaterProgressSnapshot = {
  receivedBytes: number;
  totalBytes?: number;
};

export type RethraDesignHostUpdaterErrorSnapshot = {
  code: string;
  details?: unknown;
  message: string;
};

export type RethraDesignHostUpdaterInstallResult = {
  activeVersion?: string;
  artifactPath?: string;
  dryRun?: boolean;
  helperLogPath?: string;
  launcherRuntimePath?: string;
  launchPath?: string;
  openedAt: string;
  path: string;
};

export type RethraDesignHostUpdaterReleaseSnapshot = {
  arch: string;
  artifact: RethraDesignHostUpdaterArtifactSnapshot;
  checksum: RethraDesignHostUpdaterChecksumSnapshot;
  channel: RethraDesignHostUpdaterChannel;
  downloadedAt: string;
  key: string;
  metadata?: Record<string, unknown>;
  path: string;
  platformKey: string;
  version: string;
};

export type RethraDesignHostUpdaterIncomingSnapshot = {
  arch: string;
  artifact: RethraDesignHostUpdaterArtifactSnapshot;
  channel: RethraDesignHostUpdaterChannel;
  key?: string;
  metadata?: Record<string, unknown>;
  progress?: RethraDesignHostUpdaterProgressSnapshot;
  startedAt: string;
  version: string;
};

export type RethraDesignHostUpdaterCacheLifecycleTrigger = "cold-start" | "manual" | "next-version-ready";

export type RethraDesignHostUpdaterReleaseLifecycleState =
  | "cleanup-deferred"
  | "cleanup-removed"
  | "deprecated"
  | "retained"
  | "unknown";

export type RethraDesignHostUpdaterCacheLifecycleSummary = {
  lastRunAt?: string;
  lastTrigger?: RethraDesignHostUpdaterCacheLifecycleTrigger;
  platform: string;
  releases: {
    cleanupDeferred: number;
    cleanupRemoved: number;
    deprecated: number;
    errors: number;
    retained: number;
    total: number;
    unknown: number;
  };
};

export type RethraDesignHostUpdaterCacheSnapshot = {
  lifecycle?: RethraDesignHostUpdaterCacheLifecycleSummary;
};

export type RethraDesignHostUpdaterReinstallReason =
  | "launcher-schema"
  | "outer-below-min"
  | "outer-version-unreadable";

/**
 * Present when the release feed requires a full installer reinstall instead of
 * an in-place payload update. `installedVersion` is the physically installed
 * outer package version; `url` is an optional operator-supplied explanation
 * link.
 */
export type RethraDesignHostUpdaterReinstallSnapshot = {
  installedVersion?: string;
  minVersion?: string;
  reason: RethraDesignHostUpdaterReinstallReason;
  url?: string;
};

export type RethraDesignHostUpdaterStatusSnapshot = {
  active?: RethraDesignHostUpdaterReleaseSnapshot;
  arch: string;
  artifact?: RethraDesignHostUpdaterArtifactSnapshot;
  artifactUrl?: string;
  availableVersion?: string;
  cache?: RethraDesignHostUpdaterCacheSnapshot;
  capabilities: RethraDesignHostUpdaterCapabilitySet;
  channel: RethraDesignHostUpdaterChannel;
  checksum?: RethraDesignHostUpdaterChecksumSnapshot;
  currentVersion: string;
  downloadPath?: string;
  enabled: boolean;
  error?: RethraDesignHostUpdaterErrorSnapshot;
  incoming?: RethraDesignHostUpdaterIncomingSnapshot;
  installResult?: RethraDesignHostUpdaterInstallResult;
  lastCheckedAt?: string;
  metadata?: Record<string, unknown>;
  mode: RethraDesignHostUpdaterMode;
  paths?: RethraDesignHostUpdaterPathSnapshot;
  platform: string;
  progress?: RethraDesignHostUpdaterProgressSnapshot;
  reinstall?: RethraDesignHostUpdaterReinstallSnapshot;
  state: RethraDesignHostUpdaterState;
  supported: boolean;
};

export type RethraDesignHostUpdaterResult =
  | { ok: true; status: RethraDesignHostUpdaterStatusSnapshot }
  | RethraDesignHostFailure;

export type RethraDesignHostUpdaterStatusListener = (status: RethraDesignHostUpdaterStatusSnapshot) => void;

export type RethraDesignHostUpdaterMenuLabels = {
  check: string;
  checking: string;
  downloading: string;
  install: string;
  installing: string;
  restart: string;
};

export type RethraDesignHostUpdaterOpenDialogRequest = {
  source: string;
};

export type RethraDesignHostUpdaterOpenDialogListener = (request: RethraDesignHostUpdaterOpenDialogRequest) => void;

export type RethraDesignHostBridge = {
  // Optional so older host builds still satisfy the bridge shape; callers
  // must feature-detect before invoking.
  appearance?: {
    setTheme(theme: RethraDesignHostAppearanceTheme): void;
  };
  browser: {
    clearData(options?: RethraDesignHostBrowserClearDataOptions): Promise<RethraDesignHostActionResult>;
  };
  capture: {
    page(options?: RethraDesignHostCaptureOptions): Promise<RethraDesignHostCaptureResult>;
  };
  client: RethraDesignHostClient;
  pdf: {
    print(html: string, nonce?: string, options?: RethraDesignHostPdfPrintOptions): Promise<RethraDesignHostActionResult>;
  };
  pet: {
    setVisible(visible: boolean): void;
  };
  // Optional so web builds and older desktop hosts keep the same contract.
  // Electron is the only layer that can observe a compositor-affecting
  // subframe navigation failure after the iframe DOM remains healthy.
  preview?: {
    getLatestNavigationFailure(): RethraDesignHostPreviewNavigationFailure | null;
    subscribeNavigationFailure(listener: RethraDesignHostPreviewNavigationFailureListener): () => void;
  };
  project: {
    pickAndImport(init?: RethraDesignHostProjectImportInit): Promise<RethraDesignHostProjectImportResult>;
    pickAndReplaceWorkingDir(projectId: string): Promise<RethraDesignHostProjectReplaceWorkingDirResult>;
    // Optional so older host builds still satisfy the bridge shape; callers
    // must feature-detect before invoking.
    pickWorkingDir?(): Promise<RethraDesignHostPickWorkingDirResult>;
  };
  shell: {
    openExternal(url: string): Promise<RethraDesignHostActionResult>;
    openPath(projectId: string): Promise<RethraDesignHostActionResult>;
  };
  updater: {
    check(options?: RethraDesignHostUpdaterActionOptions): Promise<RethraDesignHostUpdaterStatusSnapshot>;
    "clear-cache"(options?: RethraDesignHostUpdaterActionOptions): Promise<RethraDesignHostUpdaterStatusSnapshot>;
    download(options?: RethraDesignHostUpdaterActionOptions): Promise<RethraDesignHostUpdaterStatusSnapshot>;
    install(options?: RethraDesignHostUpdaterActionOptions): Promise<RethraDesignHostUpdaterStatusSnapshot>;
    quit(options?: RethraDesignHostUpdaterActionOptions): Promise<RethraDesignHostActionResult>;
    setMenuLabels(labels: RethraDesignHostUpdaterMenuLabels): Promise<RethraDesignHostActionResult>;
    status(options?: RethraDesignHostUpdaterActionOptions): Promise<RethraDesignHostUpdaterStatusSnapshot>;
    subscribe(listener: RethraDesignHostUpdaterStatusListener): () => void;
    subscribeOpenDialog(listener: RethraDesignHostUpdaterOpenDialogListener): () => void;
  };
  version: typeof RETHRA_DESIGN_HOST_VERSION;
};

export type RethraDesignHostGlobalScope = Record<string, unknown> & {
  window?: unknown;
};
