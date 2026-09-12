import {
  RETHRA_DESIGN_HOST_GLOBAL,
  RETHRA_DESIGN_HOST_VERSION,
  RETHRA_DESIGN_HOST_CLIENT_TYPES,
  type RethraDesignHostBridge,
  type RethraDesignHostClientType,
  type RethraDesignHostGlobalScope,
} from "./protocol.js";

/**
 * @module detection
 *
 * Locates the host bridge on a global scope and structurally validates it.
 * Owns the {@link isRethraDesignHostBridge} type guard plus the scope-lookup
 * helpers used by every renderer-facing accessor.
 */

/** @internal Narrow an unknown value to a plain record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

/** @internal True when `record[key]` is a function. */
function hasFunction(record: Record<string, unknown>, key: string): boolean {
  return typeof record[key] === "function";
}

/**
 * Structural type guard for a fully-formed {@link RethraDesignHostBridge}: checks
 * version, client type, and the presence of every required capability method.
 */
export function isRethraDesignHostBridge(value: unknown): value is RethraDesignHostBridge {
  if (!isRecord(value)) return false;
  if (value.version !== RETHRA_DESIGN_HOST_VERSION) return false;
  const client = value.client;
  if (!isRecord(client) || client.type !== RETHRA_DESIGN_HOST_CLIENT_TYPES.DESKTOP) return false;
  if (client.platform != null && typeof client.platform !== "string") return false;
  if (client.osLocale != null && typeof client.osLocale !== "string") return false;

  const shell = value.shell;
  if (!isRecord(shell) || !hasFunction(shell, "openExternal") || !hasFunction(shell, "openPath")) return false;

  const browser = value.browser;
  if (!isRecord(browser) || !hasFunction(browser, "clearData")) return false;

  const capture = value.capture;
  if (!isRecord(capture) || !hasFunction(capture, "page")) return false;

  const project = value.project;
  if (
    !isRecord(project) ||
    !hasFunction(project, "pickAndImport") ||
    !hasFunction(project, "pickAndReplaceWorkingDir")
  ) {
    return false;
  }

  const pdf = value.pdf;
  if (!isRecord(pdf) || !hasFunction(pdf, "print")) return false;

  const pet = value.pet;
  if (!isRecord(pet) || !hasFunction(pet, "setVisible")) return false;

  const updater = value.updater;
  if (
    !isRecord(updater) ||
    !hasFunction(updater, "status") ||
    !hasFunction(updater, "check") ||
    !hasFunction(updater, "clear-cache") ||
    !hasFunction(updater, "download") ||
    !hasFunction(updater, "install") ||
    !hasFunction(updater, "quit") ||
    !hasFunction(updater, "setMenuLabels") ||
    !hasFunction(updater, "subscribe") ||
    !hasFunction(updater, "subscribeOpenDialog")
  ) {
    return false;
  }

  return true;
}

/** @internal Read the host-bridge candidate from a scope (or its `window`). */
function candidateFromScope(scope: RethraDesignHostGlobalScope): unknown {
  if (RETHRA_DESIGN_HOST_GLOBAL in scope) return scope[RETHRA_DESIGN_HOST_GLOBAL];
  const windowValue = scope.window;
  if (isRecord(windowValue) && RETHRA_DESIGN_HOST_GLOBAL in windowValue) {
    return windowValue[RETHRA_DESIGN_HOST_GLOBAL];
  }
  return undefined;
}

/**
 * Resolve the validated host bridge from `scope`, or `null` when absent or
 * malformed.
 */
export function getRethraDesignHost(scope: RethraDesignHostGlobalScope = globalThis): RethraDesignHostBridge | null {
  const candidate = candidateFromScope(scope);
  return isRethraDesignHostBridge(candidate) ? candidate : null;
}

/** True when a valid RethraDesign host bridge is present on `scope`. */
export function isRethraDesignHostAvailable(scope: RethraDesignHostGlobalScope = globalThis): boolean {
  return getRethraDesignHost(scope) != null;
}

/** Detect the host client type on `scope`, falling back to web. */
export function detectRethraDesignHostClientType(scope: RethraDesignHostGlobalScope = globalThis): RethraDesignHostClientType | "web" {
  return getRethraDesignHost(scope)?.client.type ?? "web";
}
