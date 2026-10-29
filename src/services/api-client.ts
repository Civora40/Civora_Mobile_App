import * as Crypto from "expo-crypto";
import { z } from "zod";

import { ENV, isPlaceholderApiUrl } from "@/constants/env";
import {
  CivoraApiError,
  normalizeHttpStatusToCode,
} from "@/lib/errors/api-error";
import { sessionStorage } from "@/lib/secure-storage/session-storage";
import { PaginationParams } from "@/types/contracts";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions<TResponse> {
  method?: HttpMethod;
  path: string;
  query?: Record<string, string | number | boolean | undefined> | PaginationParams;
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
  /**
   * Required for safe retries on non-GET mutations.
   * Sent as `Idempotency-Key` header when provided.
   */
  idempotencyKey?: string;
  /**
   * Maximum retry attempts for idempotent requests on transient network/5xx errors.
   */
  maxRetries?: number;
  requiresAuth?: boolean;
  schema?: z.ZodType<TResponse>;
}

type UnauthorizedHandler = () => void | Promise<void>;
let onUnauthorizedCallback: UnauthorizedHandler | null = null;

export function registerUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorizedCallback = handler;
}

export function generateCorrelationId(): string {
  try {
    const uuid = Crypto.randomUUID?.();
    if (typeof uuid === "string" && uuid.length > 0) {
      return uuid;
    }
  } catch {
    // Fallback below
  }
  return `corr-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildQueryString(
  query?: Record<string, string | number | boolean | undefined> | PaginationParams
): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

/**
 * Determines whether a failed request is safe to retry.
 * Non-idempotent mutations (POST/PUT/PATCH/DELETE) are NEVER retried unless an explicit
 * `idempotencyKey` is present and the error is transient.
 */
export function isRequestSafeToRetry(
  method: HttpMethod,
  idempotencyKey: string | undefined,
  error: CivoraApiError
): boolean {
  if (!error.isRetryable) {
    return false;
  }
  if (method === "GET") {
    return true;
  }
  return Boolean(idempotencyKey && idempotencyKey.trim().length > 0);
}

async function delayMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class CivoraApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = ENV.apiBaseUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  public async request<TResponse>(
    options: ApiRequestOptions<TResponse>
  ): Promise<TResponse> {
    const {
      method = "GET",
      path,
      query,
      body,
      headers = {},
      timeoutMs = 15000,
      signal,
      idempotencyKey,
      maxRetries = method === "GET" ? 2 : 0,
      requiresAuth = true,
      schema,
    } = options;

    const correlationId = generateCorrelationId();

    if (isPlaceholderApiUrl(this.baseUrl)) {
      throw new CivoraApiError({
        code: "UNCONFIGURED_BACKEND",
        message:
          "Civora API base URL is set to the placeholder (https://api.example.invalid). Configure EXPO_PUBLIC_API_BASE_URL with the deployed Civora API endpoint.",
        correlationId,
      });
    }

    const requestHeaders: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Correlation-Id": correlationId,
      "X-Client-Platform": "civora-mobile-expo",
      ...headers,
    };

    if (idempotencyKey) {
      requestHeaders["Idempotency-Key"] = idempotencyKey;
    }

    if (requiresAuth) {
      const tokens = await sessionStorage.getTokens();
      if (!tokens) {
        throw new CivoraApiError({
          code: "UNAUTHORIZED",
          message: "Authentication session is required for this request.",
          correlationId,
        });
      }
      if (sessionStorage.isTokenExpired(tokens)) {
        if (onUnauthorizedCallback) {
          await onUnauthorizedCallback();
        }
        throw new CivoraApiError({
          code: "SESSION_EXPIRED",
          message: "Your Civora session has expired. Please sign in again.",
          correlationId,
        });
      }
      requestHeaders.Authorization = `Bearer ${tokens.accessToken}`;
    }

    const url = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}${buildQueryString(
      query
    )}`;

    let attempt = 0;

    while (true) {
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

      const onExternalAbort = () => timeoutController.abort();
      if (signal) {
        if (signal.aborted) {
          clearTimeout(timeoutId);
          throw new CivoraApiError({
            code: "ABORTED",
            message: "Request was cancelled.",
            correlationId,
          });
        }
        signal.addEventListener("abort", onExternalAbort, { once: true });
      }

      try {
        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: timeoutController.signal,
        });

        const serverCorrelationId =
          response.headers.get("x-correlation-id") ?? correlationId;

        let parsedBody: unknown = null;
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          parsedBody = await response.json();
        } else {
          const text = await response.text();
          parsedBody = text ? { message: text } : null;
        }

        if (!response.ok) {
          if (response.status === 401 && onUnauthorizedCallback) {
            await onUnauthorizedCallback();
          }

          const errorPayload =
            typeof parsedBody === "object" && parsedBody !== null
              ? (parsedBody as Record<string, unknown>)
              : {};

          const apiError = new CivoraApiError({
            code: normalizeHttpStatusToCode(response.status),
            status: response.status,
            correlationId: serverCorrelationId,
            message:
              typeof errorPayload.message === "string"
                ? errorPayload.message
                : `Civora API returned HTTP ${response.status}`,
            serverVersion:
              typeof errorPayload.serverVersion === "number"
                ? errorPayload.serverVersion
                : undefined,
            fieldErrors:
              typeof errorPayload.fieldErrors === "object" &&
              errorPayload.fieldErrors !== null
                ? (errorPayload.fieldErrors as Record<string, string[]>)
                : undefined,
          });

          if (
            attempt < maxRetries &&
            isRequestSafeToRetry(method, idempotencyKey, apiError)
          ) {
            attempt += 1;
            await delayMs(300 * Math.pow(2, attempt - 1));
            continue;
          }

          throw apiError;
        }

        if (schema) {
          const validationResult = schema.safeParse(parsedBody);
          if (!validationResult.success) {
            throw new CivoraApiError({
              code: "VALIDATION_ERROR",
              message: "Server response did not match the expected Civora contract.",
              correlationId: serverCorrelationId,
            });
          }
          return validationResult.data;
        }

        return parsedBody as TResponse;
      } catch (err) {
        if (err instanceof CivoraApiError) {
          throw err;
        }

        const isAbortedByUser = Boolean(signal?.aborted);
        const isTimeout =
          err instanceof Error && err.name === "AbortError" && !isAbortedByUser;

        const normalizedError = new CivoraApiError({
          code: isAbortedByUser
            ? "ABORTED"
            : isTimeout
              ? "TIMEOUT"
              : "NETWORK_ERROR",
          message: isAbortedByUser
            ? "Request was cancelled."
            : isTimeout
              ? "Request timed out while waiting for Civora API."
              : "Unable to reach Civora API. Check your site connectivity.",
          correlationId,
        });

        if (
          attempt < maxRetries &&
          isRequestSafeToRetry(method, idempotencyKey, normalizedError)
        ) {
          attempt += 1;
          await delayMs(300 * Math.pow(2, attempt - 1));
          continue;
        }

        throw normalizedError;
      } finally {
        clearTimeout(timeoutId);
        if (signal) {
          signal.removeEventListener("abort", onExternalAbort);
        }
      }
    }
  }
}

export const apiClient = new CivoraApiClient();
