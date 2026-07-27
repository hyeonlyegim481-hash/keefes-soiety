import "./app-version.js";

export const APP_VERSION = String(globalThis.KEEFES_APP_VERSION || "dev");
export const DEFAULT_RESOURCE_TIMEOUT_MS = 10_000;

export class ResourceLoadError extends Error {
  constructor(message, { resource = "", code = "load-error", cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = "ResourceLoadError";
    this.resource = resource;
    this.code = code;
  }
}

export function withTimeout(
  promise,
  timeoutMs = DEFAULT_RESOURCE_TIMEOUT_MS,
  resource = "resource"
) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(
        new ResourceLoadError(`${resource} timed out after ${timeoutMs}ms`, {
          resource,
          code: "timeout"
        })
      );
    }, timeoutMs);
  });

  return Promise.race([Promise.resolve(promise), timeout]).finally(() => {
    clearTimeout(timer);
  });
}

export function versionedResource(path, {
  attempt = 1,
  baseUrl = import.meta.url
} = {}) {
  const url = new URL(path, baseUrl);
  url.searchParams.set("v", APP_VERSION);
  if (attempt > 1) url.searchParams.set("retry", String(attempt));
  return url.href;
}

export function importVersioned(path, {
  attempt = 1,
  timeoutMs = DEFAULT_RESOURCE_TIMEOUT_MS,
  importer = (url) => import(url),
  baseUrl = import.meta.url
} = {}) {
  const url = versionedResource(path, { attempt, baseUrl });
  const request = Promise.resolve()
    .then(() => importer(url))
    .catch((error) => {
      throw new ResourceLoadError(`Failed to import ${path}`, {
        resource: url,
        code: "module-load",
        cause: error
      });
    });
  return withTimeout(request, timeoutMs, url);
}

export function createFeatureLoader({ logger = console } = {}) {
  const loads = new Map();
  const attempts = new Map();

  function loadFeature(key, loader) {
    const current = loads.get(key);
    if (current) return current.promise;

    const attempt = (attempts.get(key) || 0) + 1;
    attempts.set(key, attempt);
    const record = {
      key,
      attempt,
      status: "loading",
      promise: null,
      value: undefined
    };

    const promise = Promise.resolve()
      .then(() => loader({ key, attempt }))
      .then((value) => {
        if (loads.get(key) === record) {
          record.status = "loaded";
          record.value = value;
        }
        return value;
      })
      .catch((error) => {
        if (loads.get(key) === record) loads.delete(key);
        logger.error?.("[feature-loader] resource failed", {
          feature: key,
          attempt,
          resource: error?.resource || "unknown",
          error
        });
        throw error;
      });

    record.promise = promise;
    loads.set(key, record);
    return promise;
  }

  function getFeatureStatus(key) {
    return loads.get(key)?.status || "idle";
  }

  return { loadFeature, getFeatureStatus };
}

export function createStylesheetLoader({
  documentRef = globalThis.document,
  timeoutMs = DEFAULT_RESOURCE_TIMEOUT_MS
} = {}) {
  const loads = new Map();

  return function loadStylesheetOnce(id, path, { attempt = 1 } = {}) {
    if (!documentRef) {
      return Promise.reject(
        new ResourceLoadError(`Document is unavailable for ${path}`, {
          resource: path,
          code: "document-unavailable"
        })
      );
    }

    const url = versionedResource(path, {
      attempt,
      baseUrl: documentRef.baseURI || globalThis.location?.href || import.meta.url
    });
    const current = loads.get(id);
    if (current?.url === url) return current.promise;
    current?.cancel?.();

    const existing = documentRef.getElementById(id);
    const existingLoaded =
      existing?.dataset?.loadState === "loaded" &&
      existing.dataset.appVersion === APP_VERSION &&
      existing.href === url &&
      Boolean(existing.sheet);
    if (existingLoaded) return Promise.resolve(existing);
    existing?.remove();

    const link = documentRef.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = url;
    link.dataset.appVersion = APP_VERSION;
    link.dataset.loadState = "loading";

    let settled = false;
    let timer;
    let resolvePromise = () => {};
    let rejectPromise = () => {};
    const cleanup = () => {
      clearTimeout(timer);
      link.removeEventListener("load", handleLoad);
      link.removeEventListener("error", handleError);
    };
    const fail = (error, reject) => {
      if (settled) return;
      settled = true;
      cleanup();
      link.dataset.loadState = "error";
      link.remove();
      if (loads.get(id)?.link === link) loads.delete(id);
      reject(
        error instanceof ResourceLoadError
          ? error
          : new ResourceLoadError(`Failed to load stylesheet ${path}`, {
              resource: url,
              code: "stylesheet-load",
              cause: error
            })
      );
    };
    const handleLoad = () => {
      if (settled) return;
      settled = true;
      cleanup();
      link.dataset.loadState = "loaded";
      resolvePromise(link);
    };
    const handleError = (event) => fail(event, rejectPromise);

    const promise = new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
      link.addEventListener("load", handleLoad, { once: true });
      link.addEventListener("error", handleError, { once: true });
      timer = setTimeout(() => {
        fail(
          new ResourceLoadError(`Stylesheet timed out after ${timeoutMs}ms`, {
            resource: url,
            code: "timeout"
          }),
          reject
        );
      }, timeoutMs);
      documentRef.head.append(link);
    });

    const record = {
      url,
      link,
      promise,
      cancel: () => {
        fail(
          new ResourceLoadError(`Stylesheet request was replaced: ${path}`, {
            resource: url,
            code: "replaced"
          }),
          rejectPromise
        );
      }
    };
    loads.set(id, record);
    return promise;
  };
}
