/**
 * @module host
 *
 * Public barrel for `@rethra-design/host` — the RethraDesign renderer host-bridge
 * protocol. Re-exports the exact prior flat surface from the cohesive sibling
 * modules: the wire protocol (constants + types), bridge detection/validation,
 * adapter-result normalizers, and the renderer-facing action wrappers. This
 * file contains no logic.
 */

// --- protocol: constant registries + wire types ---
export {
  RETHRA_DESIGN_HOST_GLOBAL,
  RETHRA_DESIGN_HOST_VERSION,
  RETHRA_DESIGN_HOST_APPEARANCE_THEMES,
  RETHRA_DESIGN_HOST_CLIENT_TYPES,
  RETHRA_DESIGN_HOST_UPDATER_ACTIONS,
  RETHRA_DESIGN_HOST_UPDATER_STATES,
} from "./protocol.js";
export type {
  RethraDesignHostClientType,
  RethraDesignHostClient,
  RethraDesignHostFailure,
  RethraDesignHostActionResult,
  RethraDesignHostWorkspaceContext,
  RethraDesignHostProjectImportInit,
  RethraDesignHostProjectImportSuccess,
  RethraDesignHostProjectImportResult,
  RethraDesignHostProjectReplaceWorkingDirSuccess,
  RethraDesignHostProjectReplaceWorkingDirResult,
  RethraDesignHostPickWorkingDirSuccess,
  RethraDesignHostPickWorkingDirResult,
  RethraDesignHostPdfPrintOptions,
  RethraDesignHostCaptureClip,
  RethraDesignHostCaptureOptions,
  RethraDesignHostCaptureSuccess,
  RethraDesignHostCaptureResult,
  RethraDesignHostPreviewNavigationFailure,
  RethraDesignHostPreviewNavigationFailureListener,
  RethraDesignHostAppearanceTheme,
  RethraDesignHostBrowserClearDataOptions,
  RethraDesignHostUpdaterAction,
  RethraDesignHostUpdaterState,
  RethraDesignHostUpdaterMode,
  RethraDesignHostUpdaterChannel,
  RethraDesignHostUpdaterActionOptions,
  RethraDesignHostUpdaterCapabilitySet,
  RethraDesignHostUpdaterPathSnapshot,
  RethraDesignHostUpdaterChecksumSnapshot,
  RethraDesignHostUpdaterArtifactSnapshot,
  RethraDesignHostUpdaterProgressSnapshot,
  RethraDesignHostUpdaterErrorSnapshot,
  RethraDesignHostUpdaterInstallResult,
  RethraDesignHostUpdaterReleaseSnapshot,
  RethraDesignHostUpdaterIncomingSnapshot,
  RethraDesignHostUpdaterCacheLifecycleTrigger,
  RethraDesignHostUpdaterReleaseLifecycleState,
  RethraDesignHostUpdaterCacheLifecycleSummary,
  RethraDesignHostUpdaterCacheSnapshot,
  RethraDesignHostUpdaterReinstallReason,
  RethraDesignHostUpdaterReinstallSnapshot,
  RethraDesignHostUpdaterStatusSnapshot,
  RethraDesignHostUpdaterResult,
  RethraDesignHostUpdaterStatusListener,
  RethraDesignHostUpdaterMenuLabels,
  RethraDesignHostUpdaterOpenDialogRequest,
  RethraDesignHostUpdaterOpenDialogListener,
  RethraDesignHostBridge,
  RethraDesignHostGlobalScope,
} from "./protocol.js";

// --- detection: locate + validate the injected bridge ---
export {
  isRethraDesignHostBridge,
  getRethraDesignHost,
  isRethraDesignHostAvailable,
  detectRethraDesignHostClientType,
} from "./detection.js";

// --- normalize: adapter result -> renderer contract ---
export {
  normalizeRethraDesignHostProjectImportResult,
  normalizeRethraDesignHostProjectReplaceWorkingDirResult,
  normalizeRethraDesignHostPickWorkingDirResult,
} from "./normalize.js";

// --- actions: renderer-facing host action wrappers ---
export {
  openHostExternalUrl,
  openHostProjectPath,
  clearHostBrowserData,
  captureHostPage,
  pickAndImportHostProject,
  pickAndReplaceHostProjectWorkingDir,
  pickHostWorkingDir,
  printHostPdf,
  setHostPetVisible,
  getHostUpdaterStatus,
  checkHostUpdater,
  clearHostUpdaterCache,
  downloadHostUpdater,
  installHostUpdater,
  quitHostAfterUpdaterInstallerOpen,
  getLatestHostPreviewNavigationFailure,
  subscribeHostUpdater,
  subscribeHostUpdaterOpenDialog,
  subscribeHostPreviewNavigationFailure,
  setHostUpdaterMenuLabels,
} from "./actions.js";
