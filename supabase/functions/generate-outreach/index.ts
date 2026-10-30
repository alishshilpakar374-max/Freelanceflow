// deno-lint-ignore no-import-prefix
import { createClient } from "npm:@supabase/supabase-js@2";
import { callGemini } from "./gemini.ts";
import { handleRequest, parseAllowedOrigins } from "./handler.ts";
import type { Deps, HandlerConfig, QuotaVerdict } from "./handler.ts";

const MAX_BODY_BYTES = 8 * 1024;
const GEMINI_TIMEOUT_MS = 20_000;
const MAX_OUTPUT_CHARS = 3_000;
const MODEL_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const VERDICTS: readonly string[] = [
  "allowed",
  "hourly_limit",
  "daily_limit",
  "global_limit",
  "unauthenticated",
];

function log(event: string, fields: Record<string, string | number>): void {
  console.log(JSON.stringify({ event, ...fields }));
}

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
const geminiKey = Deno.env.get("GEMINI_API_KEY");
const model = Deno.env.get("GEMINI_MODEL");

let allowedOrigins: string[] = [];
let originsValid = true;
try {
  allowedOrigins = parseAllowedOrigins(Deno.env.get("ALLOWED_ORIGINS"));
} catch {
  originsValid = false;
}

// Names only: values (especially keys) are never logged.
const missing = [
  ["SUPABASE_URL", supabaseUrl],
  ["SUPABASE_ANON_KEY", anonKey],
  ["GEMINI_API_KEY", geminiKey],
  ["GEMINI_MODEL", model],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

const configProblem =
  missing.length > 0
    ? `missing: ${missing.join(", ")}`
    : !MODEL_PATTERN.test(model ?? "")
      ? "GEMINI_MODEL has an invalid format"
      : !originsValid
        ? "ALLOWED_ORIGINS is invalid"
        : allowedOrigins.length === 0
          ? "ALLOWED_ORIGINS is empty"
          : null;

if (configProblem !== null) {
  log("config_error", { problem: configProblem });
}

function authClient(authorization?: string) {
  return createClient(supabaseUrl as string, anonKey as string, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: authorization
      ? { headers: { Authorization: authorization } }
      : undefined,
  });
}

const deps: Deps = {
  verifyUser: async (accessToken) => {
    const { data, error } = await authClient().auth.getUser(accessToken);
    if (error) {
      const transient =
        error.name === "AuthRetryableFetchError" || (error.status ?? 0) >= 500;
      if (transient) throw new Error("auth_unavailable");
      return false;
    }
    return data.user !== null;
  },

  consumeQuota: async (accessToken) => {
    // Runs as the signed-in user, so auth.uid() inside the SQL function is the caller.
    const { data, error } = await authClient(`Bearer ${accessToken}`).rpc(
      "consume_ai_quota",
    );
    if (error || typeof data !== "string" || !VERDICTS.includes(data)) {
      throw new Error("quota_check_failed");
    }
    return data as QuotaVerdict;
  },

  generate: (prompt) =>
    callGemini(
      fetch,
      {
        apiKey: geminiKey as string,
        model: model as string,
        timeoutMs: GEMINI_TIMEOUT_MS,
        maxOutputChars: MAX_OUTPUT_CHARS,
      },
      prompt,
    ),

  log,
  requestId: () => crypto.randomUUID(),
};

const config: HandlerConfig = { allowedOrigins, maxBodyBytes: MAX_BODY_BYTES };

Deno.serve((req) => {
  if (configProblem !== null) {
    return new Response(
      JSON.stringify({ error: "AI outreach is not configured." }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  }
  return handleRequest(req, config, deps);
});
