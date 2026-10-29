export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "SESSION_EXPIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "ABORTED"
  | "UNCONFIGURED_BACKEND"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";

export interface ApiErrorDetails {
  code: ApiErrorCode;
  message: string;
  status?: number;
  correlationId?: string;
  serverVersion?: number;
  fieldErrors?: Record<string, string[]>;
}

export class CivoraApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly status?: number;
  public readonly correlationId?: string;
  public readonly serverVersion?: number;
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(details: ApiErrorDetails) {
    super(details.message);
    this.name = "CivoraApiError";
    this.code = details.code;
    this.status = details.status;
    this.correlationId = details.correlationId;
    this.serverVersion = details.serverVersion;
    this.fieldErrors = details.fieldErrors;
  }

  public get isRetryable(): boolean {
    return (
      this.code === "NETWORK_ERROR" ||
      this.code === "TIMEOUT" ||
      (this.code === "SERVER_ERROR" &&
        this.status !== undefined &&
        [502, 503, 504].includes(this.status))
    );
  }
}

export function normalizeHttpStatusToCode(status: number): ApiErrorCode {
  switch (status) {
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 422:
    case 400:
      return "VALIDATION_ERROR";
    default:
      return status >= 500 ? "SERVER_ERROR" : "UNKNOWN_ERROR";
  }
}

