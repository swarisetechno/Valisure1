/**
 * API Service Layer - Maps all FastAPI backend endpoints
 * Backend runs on http://localhost:8000
 */

const API_BASE_URL = "http://localhost:8000";

// ─── Auth Helpers ─────────────────────────────────────────────
function getToken(): string | null {
  return localStorage.getItem("authToken");
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// ─── Auth API ─────────────────────────────────────────────────
export const authApi = {
  login: async (usernameOrEmail: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/db/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username_or_email: usernameOrEmail,
        password: password,
      }),
    });
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/db/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ─── User API ─────────────────────────────────────────────────
export const userApi = {
  list: async () => {
    const response = await fetch(`${API_BASE_URL}/db/list-users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data: {
    username: string;
    email?: string;
    password?: string;
    phone?: string;
    department?: string;
    title?: string;
    status?: string;
    role_id?: number;
    project_allocations?: Array<{ project_id: number; role_id: number }>;
  }) => {
    const response = await fetch(`${API_BASE_URL}/db/create-user`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (
    userId: number,
    data: {
      username: string;
      email?: string;
      password?: string;
      phone?: string;
      department?: string;
      title?: string;
      status?: string;
      role_id?: number;
      project_allocations?: Array<{ project_id: number; role_id: number }>;
    }
  ) => {
    const response = await fetch(`${API_BASE_URL}/db/update-user/${userId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/db/delete-user/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ─── Role API ─────────────────────────────────────────────────
export const roleApi = {
  list: async () => {
    const response = await fetch(`${API_BASE_URL}/db/list-roles`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data: {
    name: string;
    permission_level: string;
    permissions?: Record<string, boolean>;
  }) => {
    const response = await fetch(`${API_BASE_URL}/db/create-role`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (
    roleId: number,
    data: {
      name: string;
      permission_level: string;
      permissions?: Record<string, boolean>;
    }
  ) => {
    const response = await fetch(`${API_BASE_URL}/db/update-role/${roleId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (roleId: number) => {
    const response = await fetch(`${API_BASE_URL}/db/delete-role/${roleId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ─── Project API ──────────────────────────────────────────────
export const projectApi = {
  list: async () => {
    const response = await fetch(`${API_BASE_URL}/db/projects`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/db/projects`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (projectId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/db/delete-project?project_id=${projectId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

// ─── Dashboard API ────────────────────────────────────────────
export const dashboardApi = {
  get: async (projectId?: number) => {
    const headers: Record<string, string> = getAuthHeaders();
    if (projectId) {
      headers["X-Project-Id"] = String(projectId);
    }
    const response = await fetch(`${API_BASE_URL}/db/dashboard`, {
      headers,
    });
    return handleResponse(response);
  },
};

// ─── Document API ─────────────────────────────────────────────
export const documentApi = {
  create: async (filename: string, projectId: number) => {
    const headers: Record<string, string> = getAuthHeaders();
    headers["X-Project-Id"] = String(projectId);
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({ filename }),
    });
    return handleResponse(response);
  },

  search: async (filename: string) => {
    const response = await fetch(
      `${API_BASE_URL}/db/search?filename=${encodeURIComponent(filename)}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  getInfo: async (filename: string) => {
    const response = await fetch(
      `${API_BASE_URL}/db/document-info?filename=${encodeURIComponent(filename)}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  getHeadings: async (filename: string) => {
    const response = await fetch(
      `${API_BASE_URL}/db/document-headings?filename=${encodeURIComponent(filename)}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  deleteDocument: async (filename: string) => {
    const response = await fetch(
      `${API_BASE_URL}/db/delete-document?filename=${encodeURIComponent(filename)}`,
      { method: "DELETE", headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  deleteEntry: async (entryId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/db/delete-entry?entry_id=${entryId}`,
      { method: "DELETE", headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  addEnd: async (filename: string, text: string, projectId: number, heading?: string) => {
    const headers: Record<string, string> = getAuthHeaders();
    headers["X-Project-Id"] = String(projectId);
    const body: Record<string, any> = { filename, text };
    if (heading) {
      body.heading = heading;
    }
    const response = await fetch(`${API_BASE_URL}/add-end`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  addUnder: async (
    filename: string,
    heading_text: string,
    new_text: string,
    projectId: number,
    tableFields?: { urs_id?: string; urs_title?: string; gxp?: string; gxp_reference?: string; gxp_risk?: string }
  ) => {
    const headers: Record<string, string> = getAuthHeaders();
    headers["X-Project-Id"] = String(projectId);
    const body: Record<string, any> = { filename, heading_text, new_text, ...tableFields };
    const response = await fetch(`${API_BASE_URL}/add-under`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  deleteUrsRow: async (projectId: number, ursId: string, entryId?: number) => {
    const headers: Record<string, string> = {
      ...getAuthHeaders(),
      "X-Project-Id": String(projectId),
    };
    const params = new URLSearchParams({
      filename: "URS - User Requirements Specification",
      urs_id: ursId,
    });
    if (entryId !== undefined && entryId !== null) {
      params.set("entry_id", String(entryId));
    }
    const response = await fetch(
      `${API_BASE_URL}/delete-urs-row?${params.toString()}`,
      { method: "DELETE", headers }
    );
    return handleResponse(response);
  },
};

// ─── Audit Trail API ─────────────────────────────────────────
export interface AuditLogEntry {
  id: string;
  timestamp: string | null;
  actor_id: string;
  actor_name?: string | null;
  actor_role: string | null;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string | null;
  correlation_id: string | null;
  reason_for_change: string | null;
  payload: any;
  session_id?: string | null;
  e_signature_id?: string | null;
  created_at?: string | null;
}

export interface AuditLogResponse {
  total: number;
  limit: number;
  offset: number;
  logs: AuditLogEntry[];
}

export const auditApi = {
  getLogs: async (params?: {
    resource_type?: string;
    resource_id?: string;
    actor_id?: string;
    action?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditLogResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.resource_type) searchParams.set("resource_type", params.resource_type);
    if (params?.resource_id) searchParams.set("resource_id", params.resource_id);
    if (params?.actor_id) searchParams.set("actor_id", params.actor_id);
    if (params?.action) searchParams.set("action", params.action);
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));

    const url = `${API_BASE_URL}/audit/logs${searchParams.toString() ? "?" + searchParams.toString() : ""}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getLogDetail: async (logId: string): Promise<AuditLogEntry> => {
    const response = await fetch(`${API_BASE_URL}/audit/logs/${logId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  verifyImmutability: async (logId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/audit/verify-immutability/${logId}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  healthCheck: async () => {
    const response = await fetch(`${API_BASE_URL}/health/audit`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ─── AI API ───────────────────────────────────────────────────
export const aiApi = {
  refineRequirement: async (data: { urs_id: string; title: string; description: string; project_id?: number }) => {
    const response = await fetch(`${API_BASE_URL}/db/ai/refine-requirement`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// ─── Session Helpers ──────────────────────────────────────────
export function saveAuthSession(token: string, user: any) {
  localStorage.setItem("authToken", token);
  localStorage.setItem("currentUser", JSON.stringify(user));

  // Derive role for routing - check role.permission_level
  const permLevel = user?.role?.permission_level;
  let uiRole = "user";
  if (permLevel === "admin") uiRole = "admin";
  else if (permLevel === "editor") uiRole = "author";
  else if (permLevel === "viewer") uiRole = "user";

  localStorage.setItem("userRole", uiRole);
  localStorage.setItem("userName", user?.username || "User");
}

export function clearAuthSession() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
}

export function getCurrentUser(): any | null {
  try {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
