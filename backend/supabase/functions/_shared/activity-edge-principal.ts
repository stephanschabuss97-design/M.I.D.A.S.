import {
  type AuthModeWithKey,
  createSupabaseContext,
} from "npm:@supabase/server@1.4.1";
import { createClient } from "jsr:@supabase/supabase-js@2";

declare const Deno: {
  env: { get(name: string): string | undefined };
};

export const ACTIVITY_EDGE_PRINCIPAL_SCHEMA =
  "midas.activity-edge-principal.v1";

export const ACTIVITY_EDGE_TARGETS = Object.freeze({
  protein: Object.freeze({
    authModes: Object.freeze(
      [
        "user",
        "secret:protein_targets_scheduler",
      ] as const,
    ),
    ownerEnv: "PROTEIN_TARGETS_USER_ID",
    secretName: "protein_targets_scheduler",
  }),
  trendpilot: Object.freeze({
    authModes: Object.freeze(
      [
        "user",
        "secret:trendpilot_scheduler",
      ] as const,
    ),
    ownerEnv: "TRENDPILOT_USER_ID",
    secretName: "trendpilot_scheduler",
  }),
});

export type ActivityEdgeTarget = keyof typeof ACTIVITY_EDGE_TARGETS;
export type ActivityEdgePrincipalMode = "user" | "scheduler";

export type ActivityEdgeRpcClient = {
  rpc(
    functionName: string,
    payload: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: unknown }>;
};

type ActivitySupabaseContext = {
  supabase: ActivityEdgeRpcClient;
  supabaseAdmin: ActivityEdgeRpcClient;
  userClaims: { id: string } | null;
  authMode: string;
  authKeyName?: string;
};

type ActivityContextResult =
  | { data: ActivitySupabaseContext; error: null }
  | { data: null; error: unknown };

type CreateActivityContext = (
  request: Request,
  options: { auth: AuthModeWithKey[] },
) => Promise<ActivityContextResult>;

type ActivityUser = { id?: unknown };

type ActivityUserClient = ActivityEdgeRpcClient & {
  auth: {
    getUser(token: string): PromiseLike<{
      data: { user: ActivityUser | null };
      error: unknown;
    }>;
  };
};

type CreateActivityUserClient = (token: string) => ActivityUserClient;

export type ActivityEdgePrincipalDependencies = {
  createContext?: CreateActivityContext;
  createUserClient?: CreateActivityUserClient;
  readEnv?: (name: string) => string | undefined;
};

export type ActivityEdgePrincipal = Readonly<{
  schema_version: typeof ACTIVITY_EDGE_PRINCIPAL_SCHEMA;
  mode: ActivityEdgePrincipalMode;
  owner_id: string;
  rpc_client: ActivityEdgeRpcClient;
}>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ERROR_MESSAGE = "The activity edge principal request failed.";

export class ActivityEdgePrincipalError extends Error {
  code: "UNAUTHORIZED" | "SERVER_CONFIGURATION_UNAVAILABLE";
  status: 401 | 500;
  publicMessage: "Unauthorized" | "Server configuration unavailable";
  mode: ActivityEdgePrincipalMode | null;

  constructor(
    code: ActivityEdgePrincipalError["code"],
    mode: ActivityEdgePrincipalMode | null = null,
  ) {
    super(SAFE_ERROR_MESSAGE);
    this.name = "ActivityEdgePrincipalError";
    this.code = code;
    this.status = code === "UNAUTHORIZED" ? 401 : 500;
    this.publicMessage = code === "UNAUTHORIZED"
      ? "Unauthorized"
      : "Server configuration unavailable";
    this.mode = mode;
  }
}

const readOwnNumber = (value: unknown, key: string) => {
  try {
    if (value === null || typeof value !== "object") return null;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor &&
        Object.prototype.hasOwnProperty.call(descriptor, "value") &&
        typeof descriptor.value === "number"
      ? descriptor.value
      : null;
  } catch {
    return null;
  }
};

const defaultCreateContext: CreateActivityContext = async (
  request,
  options,
) => {
  const result = await createSupabaseContext(request, {
    auth: options.auth,
  });
  return result as unknown as ActivityContextResult;
};

const createDefaultUserClient = (
  token: string,
  readEnv: (name: string) => string | undefined,
): ActivityUserClient => {
  const url = readEnv("SUPABASE_URL")?.trim();
  const anonKey = readEnv("SUPABASE_ANON_KEY")?.trim();
  if (!url || !anonKey) {
    throw new ActivityEdgePrincipalError(
      "SERVER_CONFIGURATION_UNAVAILABLE",
      "user",
    );
  }
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: { headers: { Authorization: `Bearer ${token}` } },
  }) as unknown as ActivityUserClient;
};

const mapContextError = (error: unknown): ActivityEdgePrincipalError =>
  new ActivityEdgePrincipalError(
    readOwnNumber(error, "status") === 401
      ? "UNAUTHORIZED"
      : "SERVER_CONFIGURATION_UNAVAILABLE",
  );

const readOwner = (value: unknown, mode: ActivityEdgePrincipalMode) => {
  if (typeof value !== "string" || !UUID_RE.test(value.trim())) {
    throw new ActivityEdgePrincipalError(
      mode === "user" ? "UNAUTHORIZED" : "SERVER_CONFIGURATION_UNAVAILABLE",
      mode,
    );
  }
  return value.trim().toLowerCase();
};

const readUserBearer = (request: Request) => {
  const authorization = request.headers.get("authorization");
  if (authorization === null) return null;
  const match = /^Bearer ([^\s]+)$/.exec(authorization);
  if (!match) throw new ActivityEdgePrincipalError("UNAUTHORIZED", "user");
  return match[1];
};

export const createActivityEdgePrincipal = async (
  request: Request,
  target: ActivityEdgeTarget,
  dependencies: ActivityEdgePrincipalDependencies = {},
): Promise<ActivityEdgePrincipal> => {
  const config = ACTIVITY_EDGE_TARGETS[target];
  if (!config) {
    throw new ActivityEdgePrincipalError("SERVER_CONFIGURATION_UNAVAILABLE");
  }
  const createContext = dependencies.createContext ?? defaultCreateContext;
  const readEnv = dependencies.readEnv ??
    ((name: string) => Deno.env.get(name));
  const userToken = readUserBearer(request);
  if (userToken !== null) {
    let userClient: ActivityUserClient;
    try {
      userClient = (dependencies.createUserClient ??
        ((token: string) => createDefaultUserClient(token, readEnv)))(
          userToken,
        );
    } catch (error) {
      if (error instanceof ActivityEdgePrincipalError) throw error;
      throw new ActivityEdgePrincipalError(
        "SERVER_CONFIGURATION_UNAVAILABLE",
        "user",
      );
    }
    let result: Awaited<ReturnType<ActivityUserClient["auth"]["getUser"]>>;
    try {
      result = await userClient.auth.getUser(userToken);
    } catch {
      throw new ActivityEdgePrincipalError(
        "SERVER_CONFIGURATION_UNAVAILABLE",
        "user",
      );
    }
    if (result.error) {
      const status = readOwnNumber(result.error, "status");
      throw new ActivityEdgePrincipalError(
        status === 401 || status === 403
          ? "UNAUTHORIZED"
          : "SERVER_CONFIGURATION_UNAVAILABLE",
        "user",
      );
    }
    if (!result.data.user) {
      throw new ActivityEdgePrincipalError("UNAUTHORIZED", "user");
    }
    const ownerId = readOwner(result.data.user.id, "user");
    return Object.freeze({
      schema_version: ACTIVITY_EDGE_PRINCIPAL_SCHEMA,
      mode: "user",
      owner_id: ownerId,
      rpc_client: userClient,
    });
  }
  let result: ActivityContextResult;
  try {
    result = await createContext(request, {
      auth: [`secret:${config.secretName}`],
    });
  } catch {
    throw new ActivityEdgePrincipalError("SERVER_CONFIGURATION_UNAVAILABLE");
  }
  if (result.error || !result.data) throw mapContextError(result.error);

  const context = result.data;
  if (
    context.authMode === "secret" &&
    context.authKeyName === config.secretName
  ) {
    const ownerId = readOwner(readEnv(config.ownerEnv), "scheduler");
    return Object.freeze({
      schema_version: ACTIVITY_EDGE_PRINCIPAL_SCHEMA,
      mode: "scheduler",
      owner_id: ownerId,
      rpc_client: context.supabaseAdmin,
    });
  }
  throw new ActivityEdgePrincipalError("UNAUTHORIZED");
};

export const activityEdgePrincipalLog = (
  operation: string,
  error: ActivityEdgePrincipalError,
) =>
  Object.freeze({
    operation,
    code: error.code,
    status: error.status,
    mode: error.mode,
  });
