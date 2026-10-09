import {
  type AuthModeWithKey,
  createSupabaseContext,
} from "npm:@supabase/server@1.4.1";
import {
  authenticateMidasUser,
  createEdgeUserClient,
  EdgeAuthError,
  readAuthStatus,
  readBoundSchedulerOwner,
  readNamedSchedulerEnv,
  readUserBearer,
  requireSchedulerApiKey,
} from "./edge-auth.ts";

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
  options: {
    auth: AuthModeWithKey[];
    env: ReturnType<typeof readNamedSchedulerEnv>;
  },
) => Promise<ActivityContextResult>;

type ActivityUser = { id?: unknown; is_anonymous?: unknown };

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

const defaultCreateContext: CreateActivityContext = async (
  request,
  options,
) => {
  const result = await createSupabaseContext(request, options);
  return result as unknown as ActivityContextResult;
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
  const readEnv = dependencies.readEnv ??
    ((name: string) => Deno.env.get(name));
  const mode = request.headers.has("authorization") ? "user" : "scheduler";
  try {
    const token = readUserBearer(request);
    // A configured scheduler owner must agree even for the target's user path.
    const owner = readBoundSchedulerOwner(config.ownerEnv, readEnv);
    if (token !== null) {
      const authenticated = await authenticateMidasUser(
        request,
        dependencies.createUserClient ??
          ((value: string) =>
            createEdgeUserClient(
              value,
              readEnv,
            ) as unknown as ActivityUserClient),
        readEnv,
      );
      return Object.freeze({
        schema_version: ACTIVITY_EDGE_PRINCIPAL_SCHEMA,
        mode: "user",
        owner_id: authenticated.owner_id,
        rpc_client: authenticated.client,
      });
    }
    requireSchedulerApiKey(request);
    const env = readNamedSchedulerEnv(config.secretName, readEnv);
    const result = await (dependencies.createContext ?? defaultCreateContext)(
      request,
      {
        auth: [`secret:${config.secretName}`],
        env,
      },
    );
    if (result.error || !result.data) {
      throw new EdgeAuthError(
        readAuthStatus(result.error) === 401
          ? "UNAUTHORIZED"
          : "SERVER_CONFIGURATION_UNAVAILABLE",
      );
    }
    if (
      result.data.authMode !== "secret" ||
      result.data.authKeyName !== config.secretName
    ) {
      throw new EdgeAuthError("UNAUTHORIZED");
    }
    return Object.freeze({
      schema_version: ACTIVITY_EDGE_PRINCIPAL_SCHEMA,
      mode: "scheduler",
      owner_id: owner,
      rpc_client: result.data.supabaseAdmin,
    });
  } catch (error) {
    if (error instanceof ActivityEdgePrincipalError) throw error;
    throw new ActivityEdgePrincipalError(
      error instanceof EdgeAuthError
        ? error.code
        : "SERVER_CONFIGURATION_UNAVAILABLE",
      mode,
    );
  }
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
