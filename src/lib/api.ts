const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "changeme";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || error.error || `API error ${res.status}`);
  }

  return res.json();
}

export async function apiUpload<T = unknown>(
  path: string,
  file: File,
  headers: Record<string, string> = {}
): Promise<T> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
      ...headers,
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || error.error || `API error ${res.status}`);
  }

  return res.json();
}

export async function healthCheck(): Promise<{ status: string; app: string; version: string }> {
  return apiFetch("/health");
}

export { API_URL };

// ── Connector types ───────────────────────────────────────────────────────────

export type ConnectorType = "jira" | "clickup" | "timedoctor";
export type SyncStatus = "running" | "success" | "partial" | "error";

export interface SyncRun {
  id: string;
  connector_id: string;
  started_at: string;
  finished_at: string | null;
  status: SyncStatus;
  items_fetched: number;
  items_ingested: number;
  items_skipped: number;
  error_message: string | null;
}

export interface Connector {
  id: string;
  name: string;
  connector_type: ConnectorType;
  is_enabled: boolean;
  config: string | null;
  sync_schedule: string;
  last_synced_at: string | null;
  last_sync_status: SyncStatus | null;
  created_at: string;
  updated_at: string;
  last_run: SyncRun | null;
}

export interface ConnectorCreate {
  name: string;
  connector_type: ConnectorType;
  credentials: Record<string, string>;
  config: Record<string, unknown>;
  sync_schedule: string;
}

export interface ConnectorUpdate {
  name?: string;
  credentials?: Record<string, string>;
  config?: Record<string, unknown>;
  sync_schedule?: string;
  is_enabled?: boolean;
}

export interface ConnectorListResponse {
  connectors: Connector[];
  total: number;
  offset: number;
  limit: number;
}

export interface SyncRunListResponse {
  runs: SyncRun[];
  total: number;
  offset: number;
  limit: number;
}

export interface SyncTriggerResponse {
  connector_id: string;
  run_id: string;
  message: string;
}

export interface ValidateCredentialsResponse {
  valid: boolean;
  error?: string;
}

// ── Connector API helpers ─────────────────────────────────────────────────────

export const connectorsApi = {
  list: (offset = 0, limit = 50) =>
    apiFetch<ConnectorListResponse>(`/connectors?offset=${offset}&limit=${limit}`),

  create: (body: ConnectorCreate) =>
    apiFetch<Connector>("/connectors", { method: "POST", body }),

  get: (id: string) =>
    apiFetch<Connector>(`/connectors/${id}`),

  update: (id: string, body: ConnectorUpdate) =>
    apiFetch<Connector>(`/connectors/${id}`, { method: "PATCH", body }),

  delete: (id: string) =>
    apiFetch<void>(`/connectors/${id}`, { method: "DELETE" }),

  syncNow: (id: string) =>
    apiFetch<SyncTriggerResponse>(`/connectors/${id}/sync`, { method: "POST" }),

  listRuns: (id: string, offset = 0, limit = 20) =>
    apiFetch<SyncRunListResponse>(`/connectors/${id}/runs?offset=${offset}&limit=${limit}`),

  getRun: (id: string, runId: string) =>
    apiFetch<SyncRun>(`/connectors/${id}/runs/${runId}`),

  validate: (id: string) =>
    apiFetch<ValidateCredentialsResponse>(`/connectors/${id}/validate`, { method: "POST" }),
};
