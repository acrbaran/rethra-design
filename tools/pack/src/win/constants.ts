export const PRODUCT_NAME = "Rethra Design";
export const DESKTOP_LOG_ECHO_ENV = "OD_DESKTOP_LOG_ECHO";
export const WEB_STANDALONE_HOOK_CONFIG_ENV = "OD_TOOLS_PACK_WEB_STANDALONE_HOOK_CONFIG";
export const WEB_STANDALONE_RESOURCE_NAME = "rethra-design-web-standalone";
export const ELECTRON_BUILDER_ASAR = false;
export const ELECTRON_BUILDER_BUILD_DEPENDENCIES_FROM_SOURCE = false;
export const ELECTRON_BUILDER_NODE_GYP_REBUILD = false;
export const ELECTRON_BUILDER_NPM_REBUILD = false;
export const ELECTRON_REBUILD_MODE = "sequential" as const;
export const ELECTRON_REBUILD_NATIVE_MODULES = ["better-sqlite3"] as const;
export const ELECTRON_BUILDER_FILE_PATTERNS = [
  "**/*",
  "!**/node_modules/.bin",
  "!**/node_modules/electron{,/**/*}",
  "!**/*.map",
  "!**/*.tsbuildinfo",
  "!**/.next/cache",
  "!**/.next/cache/**",
  "!**/node_modules/better-sqlite3/build/Release/obj",
  "!**/node_modules/better-sqlite3/build/Release/obj/**",
  "!**/node_modules/better-sqlite3/deps",
  "!**/node_modules/better-sqlite3/deps/**",
] as const;
export const NSIS_INSTALLER_LANGUAGE_BY_WEB_LOCALE = {
  en: "en_US",
  fa: "fa_IR",
  "pt-BR": "pt_BR",
  ru: "ru_RU",
  "zh-CN": "zh_CN",
  "zh-TW": "zh_TW",
} as const;
export const INTERNAL_PACKAGES = [
  { directory: "packages/release", name: "@rethra-design/release" },
  { directory: "packages/components", name: "@rethra-design/components" },
  { directory: "packages/contracts", name: "@rethra-design/contracts" },
  { directory: "packages/registry-protocol", name: "@rethra-design/registry-protocol" },
  { directory: "packages/sidecar-proto", name: "@rethra-design/sidecar-proto" },
  { directory: "packages/launcher-proto", name: "@rethra-design/launcher-proto" },
  { directory: "packages/platform", name: "@rethra-design/platform" },
  { directory: "packages/sidecar", name: "@rethra-design/sidecar" },
  { directory: "packages/download", name: "@rethra-design/download" },
  { directory: "packages/host", name: "@rethra-design/host" },
  { directory: "packages/agui-adapter", name: "@rethra-design/agui-adapter" },
  { directory: "packages/plugin-runtime", name: "@rethra-design/plugin-runtime" },
  { directory: "packages/diagnostics", name: "@rethra-design/diagnostics" },
  { directory: "apps/daemon", name: "@rethra-design/daemon" },
  { directory: "apps/web", name: "@rethra-design/web" },
  { directory: "apps/desktop", name: "@rethra-design/desktop" },
  { directory: "apps/packaged", name: "@rethra-design/packaged" },
] as const;
