import { createClient } from "jsr:@supabase/supabase-js@2";
import { createSupabaseContext } from "npm:@supabase/server@1.4.1";

export type EdgeEnvReader = (name: string) => string | undefined;
export const readEdgeEnv: EdgeEnvReader = (name) => Deno.env.get(name);
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PUBLIC_KEY = /^sb_publishable_[A-Za-z0-9_-]+$/;
const SECRET_KEY = /^sb_secret_[A-Za-z0-9_-]+$/;

export class EdgeAuthError extends Error {
  readonly status: 401 | 500;
  readonly publicMessage: "Unauthorized" | "Server configuration unavailable";
  constructor(
    readonly code: "UNAUTHORIZED" | "SERVER_CONFIGURATION_UNAVAILABLE",
  ) {
    super("The edge authentication request failed.");
    this.name = "EdgeAuthError";
    this.status = code === "UNAUTHORIZED" ? 401 : 500;
    this.publicMessage = code === "UNAUTHORIZED"
      ? "Unauthorized"
      : "Server configuration unavailable";
  }
}

const configurationError = () =>
  new EdgeAuthError("SERVER_CONFIGURATION_UNAVAILABLE");
export const readAuthStatus = (value: unknown): number | null => {
  try {
    if (value === null || typeof value !== "object") return null;
    const descriptor = Object.getOwnPropertyDescriptor(value, "status");
    return descriptor && Object.hasOwn(descriptor, "value") &&
        typeof descriptor.value === "number"
      ? descriptor.value
      : null;
  } catch {
    return null;
  }
};

export const canonicalOwner = (value: unknown): string | null =>
  typeof value === "string" && UUID.test(value.trim())
    ? value.trim().toLowerCase()
    : null;

export const readMidasOwner = (
  readEnv: EdgeEnvReader = readEdgeEnv,
): string => {
  const owner = canonicalOwner(readEnv("MIDAS_OWNER_USER_ID"));
  if (!owner) throw configurationError();
  return owner;
};

export const readBoundSchedulerOwner = (
  name: string,
  readEnv: EdgeEnvReader = readEdgeEnv,
): string => {
  const owner = readMidasOwner(readEnv);
  if (canonicalOwner(readEnv(name)) !== owner) throw configurationError();
  return owner;
};

// This is a type/selection check, never JWT verification or project authentication.
const legacyKeyRole = (
  value: string,
  role: "anon" | "service_role",
): boolean => {
  try {
    const parts = value.split(".");
    if (
      parts.length !== 3 || parts.some((part) => !/^[A-Za-z0-9_-]+$/.test(part))
    ) return false;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(
      atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "=")),
    );
    return claims !== null && typeof claims === "object" &&
      claims.role === role;
  } catch {
    return false;
  }
};

const readSelectedKey = (
  plural: string,
  legacy: string,
  name: string,
  modernType: RegExp,
  role: "anon" | "service_role",
  readEnv: EdgeEnvReader,
): string => {
  const raw = readEnv(plural);
  if (raw !== undefined) {
    let map: unknown;
    try {
      map = JSON.parse(raw);
    } catch {
      throw configurationError();
    }
    if (
      map === null || typeof map !== "object" || Array.isArray(map) ||
      !Object.hasOwn(map, name)
    ) throw configurationError();
    const key = (map as Record<string, unknown>)[name];
    if (typeof key !== "string" || !modernType.test(key)) {
      throw configurationError();
    }
    return key;
  }
  const key = readEnv(legacy);
  if (typeof key !== "string" || !legacyKeyRole(key, role)) {
    throw configurationError();
  }
  return key;
};

export const readServerPublishableKey = (
  readEnv: EdgeEnvReader = readEdgeEnv,
): string =>
  readSelectedKey(
    "SUPABASE_PUBLISHABLE_KEYS",
    "SUPABASE_ANON_KEY",
    "default",
    PUBLIC_KEY,
    "anon",
    readEnv,
  );

// Legacy fallback is only for internal clients during the documented transition.
// It never authorizes a legacy credential as a named scheduler caller.
export const readServerSecretKey = (
  name: string,
  readEnv: EdgeEnvReader = readEdgeEnv,
): string =>
  readSelectedKey(
    "SUPABASE_SECRET_KEYS",
    "SUPABASE_SERVICE_ROLE_KEY",
    name,
    SECRET_KEY,
    "service_role",
    readEnv,
  );

export const readServerUrl = (readEnv: EdgeEnvReader = readEdgeEnv): string => {
  const raw = readEnv("SUPABASE_URL");
  try {
    if (!raw || raw.trim() !== raw) throw configurationError();
    const url = new URL(raw);
    if (
      !["https:", "http:"].includes(url.protocol) || url.username ||
      url.password || url.search || url.hash
    ) throw configurationError();
    return raw;
  } catch {
    throw configurationError();
  }
};

export const readNamedSchedulerEnv = (
  name: string,
  readEnv: EdgeEnvReader = readEdgeEnv,
) => {
  const secret = readServerSecretKey(name, readEnv);
  if (!SECRET_KEY.test(secret)) throw configurationError();
  return {
    url: readServerUrl(readEnv),
    publishableKeys: { default: readServerPublishableKey(readEnv) },
    secretKeys: { [name]: secret },
    // This context permits only a named secret. An explicit empty set prevents
    // SDK nullish fallback from consulting unrelated JWT/JWKS environment.
    // User verification remains server-side GetUser, outside this SDK context.
    jwks: { keys: [] },
  };
};

export const readUserBearer = (request: Request): string | null => {
  const authorization = request.headers.get("authorization");
  if (authorization === null) return null;
  const match = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/
    .exec(authorization);
  if (!match) throw new EdgeAuthError("UNAUTHORIZED");
  return match[1];
};

export const requireSchedulerApiKey = (request: Request): void => {
  const key = request.headers.get("apikey");
  if (!key || !SECRET_KEY.test(key)) throw new EdgeAuthError("UNAUTHORIZED");
};

export type EdgeAuthUser = { id?: unknown; is_anonymous?: unknown };
export type EdgeAuthUserClient = {
  auth: {
    getUser(
      token: string,
    ): PromiseLike<{ data: { user: EdgeAuthUser | null }; error: unknown }>;
  };
};

export const createEdgeUserClient = (
  token: string,
  readEnv: EdgeEnvReader = readEdgeEnv,
) =>
  createClient(readServerUrl(readEnv), readServerPublishableKey(readEnv), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

export const authenticateMidasUser = async <Client extends EdgeAuthUserClient>(
  request: Request,
  createUserClient: (token: string) => Client,
  readEnv: EdgeEnvReader = readEdgeEnv,
): Promise<{ owner_id: string; client: Client }> => {
  const token = readUserBearer(request);
  if (token === null) throw new EdgeAuthError("UNAUTHORIZED");
  const owner = readMidasOwner(readEnv);
  try {
    const client = createUserClient(token);
    const result = await client.auth.getUser(token);
    if (result.error) {
      const status = readAuthStatus(result.error);
      throw new EdgeAuthError(
        status === 401 || status === 403
          ? "UNAUTHORIZED"
          : "SERVER_CONFIGURATION_UNAVAILABLE",
      );
    }
    const user = result.data.user;
    if (
      !user || user.is_anonymous !== false || canonicalOwner(user.id) !== owner
    ) throw new EdgeAuthError("UNAUTHORIZED");
    return { owner_id: owner, client };
  } catch (error) {
    if (error instanceof EdgeAuthError) throw error;
    throw configurationError();
  }
};

export const authenticateEdgeUser = (
  request: Request,
  readEnv: EdgeEnvReader = readEdgeEnv,
) =>
  authenticateMidasUser(
    request,
    (token) => createEdgeUserClient(token, readEnv),
    readEnv,
  );

export const authenticateIncidentScheduler = async (
  request: Request,
  readEnv: EdgeEnvReader = readEdgeEnv,
) => {
  // Incident is secret-only. Even a valid user bearer cannot select a fallback.
  if (request.headers.has("authorization")) {
    throw new EdgeAuthError("UNAUTHORIZED");
  }
  requireSchedulerApiKey(request);
  const owner = readBoundSchedulerOwner("INCIDENTS_USER_ID", readEnv);
  const name = "incidents_push_scheduler";
  try {
    const result = await createSupabaseContext(request, {
      auth: [`secret:${name}`],
      env: readNamedSchedulerEnv(name, readEnv),
    });
    if (result.error || !result.data) {
      throw new EdgeAuthError(
        readAuthStatus(result.error) === 401
          ? "UNAUTHORIZED"
          : "SERVER_CONFIGURATION_UNAVAILABLE",
      );
    }
    if (result.data.authMode !== "secret" || result.data.authKeyName !== name) {
      throw new EdgeAuthError("UNAUTHORIZED");
    }
    return { owner_id: owner, client: result.data.supabaseAdmin };
  } catch (error) {
    if (error instanceof EdgeAuthError) throw error;
    throw configurationError();
  }
};
