const { contextBridge, ipcRenderer } = require('electron');

import type {
  RethraDesignHostBridge,
  RethraDesignHostActionResult,
  RethraDesignHostBrowserClearDataOptions,
  RethraDesignHostCaptureOptions,
  RethraDesignHostCaptureResult,
  RethraDesignHostFailure,
  RethraDesignHostProjectImportResult,
  RethraDesignHostProjectImportInit,
  RethraDesignHostProjectReplaceWorkingDirResult,
  RethraDesignHostPickWorkingDirResult,
  RethraDesignHostPreviewNavigationFailure,
  RethraDesignHostPreviewNavigationFailureListener,
  RethraDesignHostUpdaterActionOptions,
  RethraDesignHostUpdaterMenuLabels,
  RethraDesignHostUpdaterOpenDialogListener,
  RethraDesignHostUpdaterOpenDialogRequest,
  RethraDesignHostUpdaterStatusListener,
  RethraDesignHostUpdaterStatusSnapshot,
} from '@rethra-design/host';

const RETHRA_DESIGN_HOST_GLOBAL: typeof import('@rethra-design/host').RETHRA_DESIGN_HOST_GLOBAL = '__od__';
const RETHRA_DESIGN_HOST_VERSION: typeof import('@rethra-design/host').RETHRA_DESIGN_HOST_VERSION = 2;
const UPDATER_STATUS_EVENT = 'od:update:status-changed';
const UPDATER_OPEN_DIALOG_EVENT = 'od:update:open-dialog';
const APP_CONFIG_CHANGED_IPC_CHANNEL = 'od:app-config-changed';
const APP_CONFIG_CHANGED_EVENT = 'rethra-design:app-config-changed';
const PREVIEW_NAVIGATION_FAILURE_IPC_CHANNEL = 'od:preview-navigation-failed';

// Mirror of the argv prefix used by main's `applyOsLocaleSwitch` and
// runtime's `additionalArguments`. Duplicated literal on purpose: the
// preload bundle must not pull in `@rethra-design/desktop/main` (it
// transitively requires non-electron node modules that the sandboxed
// preload can't load).
const OS_LOCALE_ARG_PREFIX = '--od-os-locale=';

function readOsLocaleFromArgv(): string | undefined {
  for (const arg of process.argv) {
    if (typeof arg === 'string' && arg.startsWith(OS_LOCALE_ARG_PREFIX)) {
      const value = arg.slice(OS_LOCALE_ARG_PREFIX.length);
      if (value.length === 0) return undefined;
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return undefined;
}

type PrintPdfOptions = {
  deck?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null && !Array.isArray(value);
}

function reasonFromError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function failure(reason: string, details?: unknown): RethraDesignHostFailure {
  return {
    ...(details === undefined ? {} : { details }),
    ok: false,
    reason,
  };
}

function actionFailure(reason: string, details?: unknown): RethraDesignHostActionResult {
  return failure(reason, details);
}

function importFailure(reason: string): RethraDesignHostProjectImportResult {
  return failure(reason);
}

function replaceWorkingDirFailure(reason: string): RethraDesignHostProjectReplaceWorkingDirResult {
  return failure(reason);
}

function normalizeProjectReplaceWorkingDirResult(input: unknown): RethraDesignHostProjectReplaceWorkingDirResult {
  if (!isRecord(input)) return failure('desktop working-dir replace returned an invalid response', input);
  if (input.ok !== true) {
    if (input.canceled === true) return { canceled: true, ok: false };
    return failure(
      typeof input.reason === 'string' && input.reason.length > 0 ? input.reason : 'unknown failure',
      input.details,
    );
  }

  const response = input.response;
  if (!isRecord(response)) return failure('daemon working-dir response was not an object', response);
  const baseDir = typeof response.baseDir === 'string' ? response.baseDir : null;
  const entryFile =
    typeof response.entryFile === 'string' ? response.entryFile : null;
  if (baseDir == null) {
    return failure('daemon working-dir response did not include baseDir', response);
  }

  return { baseDir, entryFile, ok: true };
}

function pickWorkingDirFailure(reason: string): RethraDesignHostPickWorkingDirResult {
  return failure(reason);
}

function normalizePickWorkingDirResult(input: unknown): RethraDesignHostPickWorkingDirResult {
  if (!isRecord(input)) return failure('desktop working-dir pick returned an invalid response', input);
  if (input.ok !== true) {
    if (input.canceled === true) return { canceled: true, ok: false };
    return failure(
      typeof input.reason === 'string' && input.reason.length > 0 ? input.reason : 'unknown failure',
      input.details,
    );
  }
  const baseDir = typeof input.baseDir === 'string' ? input.baseDir : null;
  const token = typeof input.token === 'string' ? input.token : null;
  if (baseDir == null || token == null) {
    return failure('desktop working-dir pick did not include baseDir and token', input);
  }
  return { baseDir, ok: true, token };
}

function normalizeProjectImportResult(input: unknown): RethraDesignHostProjectImportResult {
  if (!isRecord(input)) return failure('desktop import returned an invalid response', input);
  if (input.ok !== true) {
    if (input.canceled === true) return { canceled: true, ok: false };
    return failure(
      typeof input.reason === 'string' && input.reason.length > 0 ? input.reason : 'unknown failure',
      input.details,
    );
  }

  const response = input.response;
  if (!isRecord(response)) return failure('daemon import response was not an object', response);
  const project = response.project;
  const rawProjectId = isRecord(project) ? project.id : null;
  const projectId = typeof rawProjectId === 'string' ? rawProjectId : null;
  const conversationId = typeof response.conversationId === 'string' ? response.conversationId : null;
  const entryFile =
    typeof response.entryFile === 'string' || response.entryFile === null
      ? response.entryFile
      : undefined;
  if (projectId == null || conversationId == null || entryFile === undefined) {
    return failure('daemon import response did not include host project identifiers', response);
  }

  return {
    conversationId,
    entryFile,
    ok: true,
    projectId,
  };
}

// PR #974 trust boundary. The renderer no longer receives a raw
// filesystem path from the main process: `pickFolder` was deleted from
// this bridge and replaced with `pickAndImport`, which shows the
// folder picker, mints an HMAC token bound to the chosen path, and
// POSTs `/api/import/folder` from the main process — all atomically.
// The renderer only ever sees the host-owned project identifiers or a
// structured error envelope. A compromised renderer cannot name an
// arbitrary baseDir even indirectly because the picker dialog is the
// single source of paths crossing into the daemon, and it lives in the
// main process.

// Keep this file dependency-free at runtime: in sandbox: true preloads only
// the `electron` module is safe to require. The diagnostics channel name is
// duplicated from main/diagnostics.ts on purpose so the preload bundle does
// not pull in node-only modules transitively.
const DESKTOP_DIAGNOSTICS_IPC_CHANNEL = 'diagnostics:export-to-file';

type DesktopDiagnosticsExportResult =
  | { ok: true; path: string }
  | { ok: false; cancelled: true }
  | { ok: false; cancelled: false; message: string };

const project = {
  pickAndImport: (
    init?: RethraDesignHostProjectImportInit,
  ): Promise<RethraDesignHostProjectImportResult> =>
    ipcRenderer.invoke('dialog:pick-and-import', init ?? null)
      .then(normalizeProjectImportResult)
      .catch((error: unknown) => importFailure(reasonFromError(error))),
  pickAndReplaceWorkingDir: (projectId: string): Promise<RethraDesignHostProjectReplaceWorkingDirResult> =>
    ipcRenderer.invoke('dialog:pick-and-replace-working-dir', { projectId })
      .then(normalizeProjectReplaceWorkingDirResult)
      .catch((error: unknown) => replaceWorkingDirFailure(reasonFromError(error))),
  pickWorkingDir: (): Promise<RethraDesignHostPickWorkingDirResult> =>
    ipcRenderer.invoke('dialog:pick-working-dir')
      .then(normalizePickWorkingDirResult)
      .catch((error: unknown) => pickWorkingDirFailure(reasonFromError(error))),
};

const shell = {
  openExternal: async (url: string): Promise<RethraDesignHostActionResult> => {
    try {
      const opened = await ipcRenderer.invoke('shell:open-external', url);
      return opened === true
        ? { ok: true }
        : actionFailure('external URL was not opened');
    } catch (error) {
      return actionFailure(reasonFromError(error));
    }
  },
  // Reveals the named project's working directory in the OS file
  // manager. The renderer passes a project ID; the main process asks
  // the daemon for the canonical resolvedDir and forwards that path
  // (validated) to shell.openPath. For folder-imported projects, the
  // main process additionally requires `metadata.fromTrustedPicker`
  // to be true (set by the HMAC-gated import flow), so renderer code
  // cannot ask the bridge to open arbitrary local paths even
  // indirectly through legacy or future project-creation routes.
  openPath: async (projectId: string): Promise<RethraDesignHostActionResult> => {
    try {
      const result = await ipcRenderer.invoke('shell:open-path', projectId);
      if (typeof result === 'string' && result.length > 0) return actionFailure(result);
      return { ok: true };
    } catch (error) {
      return actionFailure(reasonFromError(error));
    }
  },
};

const browser = {
  clearData: async (options?: RethraDesignHostBrowserClearDataOptions): Promise<RethraDesignHostActionResult> => {
    try {
      return await ipcRenderer.invoke('browser:clear-data', options ?? null);
    } catch (error) {
      return actionFailure(reasonFromError(error));
    }
  },
};

const capture = {
  page: async (options?: RethraDesignHostCaptureOptions): Promise<RethraDesignHostCaptureResult> => {
    try {
      return await ipcRenderer.invoke('od:capture-page', options ?? null);
    } catch (error) {
      return failure(reasonFromError(error));
    }
  },
};

let latestPreviewNavigationFailure: RethraDesignHostPreviewNavigationFailure | null = null;
const previewNavigationFailureListeners = new Set<RethraDesignHostPreviewNavigationFailureListener>();

ipcRenderer.on(PREVIEW_NAVIGATION_FAILURE_IPC_CHANNEL, (
  _event: unknown,
  failure: RethraDesignHostPreviewNavigationFailure,
): void => {
  if (
    failure == null
    || typeof failure !== 'object'
    || !Number.isSafeInteger(failure.eventId)
    || typeof failure.errorCode !== 'number'
    || !Number.isFinite(failure.occurredAtMs)
    || typeof failure.validatedUrl !== 'string'
    || (failure.frameName !== undefined && typeof failure.frameName !== 'string')
  ) return;
  latestPreviewNavigationFailure = failure;
  for (const listener of previewNavigationFailureListeners) {
    try {
      listener(failure);
    } catch {
      // A renderer listener must not prevent other active viewers from
      // receiving the same host-owned failure signal.
    }
  }
});

const preview = {
  getLatestNavigationFailure: (): RethraDesignHostPreviewNavigationFailure | null =>
    latestPreviewNavigationFailure,
  subscribeNavigationFailure: (
    listener: RethraDesignHostPreviewNavigationFailureListener,
  ): (() => void) => {
    previewNavigationFailureListeners.add(listener);
    return () => {
      previewNavigationFailureListeners.delete(listener);
    };
  },
};

function invokeUpdater(
  action: 'check' | 'clear-cache' | 'download' | 'install' | 'status',
  options?: RethraDesignHostUpdaterActionOptions,
): Promise<RethraDesignHostUpdaterStatusSnapshot> {
  return ipcRenderer.invoke(`od:update:${action}`, options ?? null);
}

const updater = {
  check: (options?: RethraDesignHostUpdaterActionOptions): Promise<RethraDesignHostUpdaterStatusSnapshot> =>
    invokeUpdater('check', options),
  'clear-cache': (options?: RethraDesignHostUpdaterActionOptions): Promise<RethraDesignHostUpdaterStatusSnapshot> =>
    invokeUpdater('clear-cache', options),
  download: (options?: RethraDesignHostUpdaterActionOptions): Promise<RethraDesignHostUpdaterStatusSnapshot> =>
    invokeUpdater('download', options),
  install: (options?: RethraDesignHostUpdaterActionOptions): Promise<RethraDesignHostUpdaterStatusSnapshot> =>
    invokeUpdater('install', options),
  quit: async (options?: RethraDesignHostUpdaterActionOptions): Promise<RethraDesignHostActionResult> => {
    try {
      return await ipcRenderer.invoke('od:update:quit', options ?? null);
    } catch (error) {
      return actionFailure(reasonFromError(error));
    }
  },
  setMenuLabels: async (labels: RethraDesignHostUpdaterMenuLabels): Promise<RethraDesignHostActionResult> => {
    try {
      return await ipcRenderer.invoke('od:update:set-menu-labels', labels);
    } catch (error) {
      return actionFailure(reasonFromError(error));
    }
  },
  status: (options?: RethraDesignHostUpdaterActionOptions): Promise<RethraDesignHostUpdaterStatusSnapshot> =>
    invokeUpdater('status', options),
  subscribe: (listener: RethraDesignHostUpdaterStatusListener): (() => void) => {
    const handler = (_event: unknown, status: RethraDesignHostUpdaterStatusSnapshot): void => {
      listener(status);
    };
    ipcRenderer.on(UPDATER_STATUS_EVENT, handler);
    return () => {
      ipcRenderer.removeListener(UPDATER_STATUS_EVENT, handler);
    };
  },
  subscribeOpenDialog: (listener: RethraDesignHostUpdaterOpenDialogListener): (() => void) => {
    const handler = (_event: unknown, request: RethraDesignHostUpdaterOpenDialogRequest): void => {
      if (request == null || typeof request !== 'object' || typeof request.source !== 'string') return;
      listener({ source: request.source });
    };
    ipcRenderer.on(UPDATER_OPEN_DIALOG_EVENT, handler);
    return () => {
      ipcRenderer.removeListener(UPDATER_OPEN_DIALOG_EVENT, handler);
    };
  },
};

const osLocale = readOsLocaleFromArgv();

ipcRenderer.on(APP_CONFIG_CHANGED_IPC_CHANNEL, () => {
  window.dispatchEvent(new CustomEvent(APP_CONFIG_CHANGED_EVENT));
});

const hostBridge = {
  version: RETHRA_DESIGN_HOST_VERSION,
  client: {
    type: 'desktop',
    platform: process.platform,
    ...(osLocale !== undefined ? { osLocale } : {}),
  },
  appearance: {
    // Pin the native window appearance (macOS vibrancy glass material) to the
    // app theme. Fire-and-forget: the main process validates the value.
    setTheme: (theme: 'light' | 'dark' | 'system'): void =>
      ipcRenderer.send('od:appearance:set-theme', theme),
  },
  shell,
  browser,
  capture,
  preview,
  project,
  pdf: {
    print: async (html: string, nonce?: string, options?: PrintPdfOptions): Promise<RethraDesignHostActionResult> => {
      try {
        await ipcRenderer.invoke('od:print-pdf', html, nonce, options ?? null);
        return { ok: true };
      } catch (error) {
        return actionFailure(reasonFromError(error));
      }
    },
  },
  pet: {
    setVisible: (visible: boolean): void =>
      ipcRenderer.send('desktop-pet:set-visible', Boolean(visible)),
  },
  updater,
} satisfies RethraDesignHostBridge;

contextBridge.exposeInMainWorld(RETHRA_DESIGN_HOST_GLOBAL, hostBridge);

contextBridge.exposeInMainWorld('rethraDesignDesktop', {
  exportDiagnostics: (): Promise<DesktopDiagnosticsExportResult> =>
    ipcRenderer.invoke(DESKTOP_DIAGNOSTICS_IPC_CHANNEL) as Promise<DesktopDiagnosticsExportResult>,
});
