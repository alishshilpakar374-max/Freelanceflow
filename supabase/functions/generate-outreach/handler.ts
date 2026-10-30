import type { GeminiResult, Prompt } from './gemini.ts'
import { buildSystemPrompt, buildUserPrompt, parseOutreachRequest } from './validate.ts'

export type QuotaVerdict =
  | 'allowed'
  | 'hourly_limit'
  | 'daily_limit'
  | 'global_limit'
  | 'unauthenticated'

export interface HandlerConfig {
  allowedOrigins: readonly string[]
  maxBodyBytes: number
}

export interface Deps {
  // true = valid signed-in user, false = not authenticated, throws = auth service unavailable
  verifyUser: (accessToken: string) => Promise<boolean>
  // Runs consume_ai_quota() in PostgreSQL as that user. Throws if the check itself fails.
  consumeQuota: (accessToken: string) => Promise<QuotaVerdict>
  generate: (prompt: Prompt) => Promise<GeminiResult>
  // Only ever receives short codes and numbers: never prompts, outputs, tokens, emails or keys.
  log: (event: string, fields: Record<string, string | number>) => void
  requestId: () => string
}

const JWT_BEARER = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/

// Parses the ALLOWED_ORIGINS secret. Wildcards are refused: CORS is a browser safety net,
// not authentication, and "*" would remove even that.
export function parseAllowedOrigins(raw: string | undefined): string[] {
  if (raw === undefined || raw.trim() === '') return []

  return raw
    .split(',')
    .map((item) => item.trim().replace(/\/+$/, ''))
    .filter((item) => item !== '')
    .map((origin) => {
      if (origin.includes('*')) throw new Error('ALLOWED_ORIGINS must not contain wildcards')

      let parsed: URL
      try {
        parsed = new URL(origin)
      } catch {
        throw new Error('ALLOWED_ORIGINS contains an invalid origin')
      }

      const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:'
      if (!isHttp || parsed.origin !== origin) {
        throw new Error('ALLOWED_ORIGINS entries must look like https://example.com (no path)')
      }
      return origin
    })
}

async function readLimitedBody(req: Request, maxBytes: number): Promise<string | null> {
  if (req.body === null) return ''

  const reader = req.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break

    total += value.byteLength
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined)
      return null
    }
    chunks.push(value)
  }

  const merged = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(merged)
}

export async function handleRequest(req: Request, config: HandlerConfig, deps: Deps): Promise<Response> {
  const requestId = deps.requestId()
  const startedAt = performance.now()
  const origin = req.headers.get('Origin')
  const originAllowed = origin !== null && config.allowedOrigins.includes(origin)

  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    Vary: 'Origin',
  }
  if (originAllowed) {
    baseHeaders['Access-Control-Allow-Origin'] = origin
    baseHeaders['Access-Control-Allow-Headers'] = 'authorization, x-client-info, apikey, content-type'
    baseHeaders['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
  }

  const finish = (status: number, body: Record<string, unknown>, reason: string, extra?: HeadersInit): Response => {
    deps.log('request_finished', {
      requestId,
      status,
      reason,
      durationMs: Math.round(performance.now() - startedAt),
    })
    const headers = new Headers(baseHeaders)
    if (extra) new Headers(extra).forEach((value, key) => headers.set(key, value))
    return new Response(JSON.stringify(body), { status, headers })
  }
  const fail = (status: number, message: string, reason: string, extra?: HeadersInit): Response =>
    finish(status, { error: message, requestId }, reason, extra)

  // 1. Browser origin allowlist. Requests with no Origin header (curl, servers) are not
  //    restricted here, which is why authentication below is the real gate.
  if (origin !== null && !originAllowed) {
    deps.log('request_finished', { requestId, status: 403, reason: 'origin_not_allowed', durationMs: 0 })
    return new Response(JSON.stringify({ error: 'Origin not allowed.', requestId }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin' },
    })
  }

  if (req.method === 'OPTIONS') {
    const headers = new Headers(baseHeaders)
    headers.set('Access-Control-Max-Age', '600')
    headers.delete('Content-Type')
    return new Response(null, { status: 204, headers })
  }

  if (req.method !== 'POST') return fail(405, 'Method not allowed.', 'bad_method', { Allow: 'POST, OPTIONS' })

  // 2. Cheap checks first (no network, no database, no provider).
  if (!(req.headers.get('Content-Type') ?? '').toLowerCase().startsWith('application/json')) {
    return fail(415, 'Send JSON.', 'bad_content_type')
  }

  const declaredLength = Number(req.headers.get('Content-Length'))
  if (Number.isFinite(declaredLength) && declaredLength > config.maxBodyBytes) {
    return fail(413, 'Request is too large.', 'body_too_large')
  }

  const match = JWT_BEARER.exec(req.headers.get('Authorization') ?? '')
  if (match === null) return fail(401, 'Please sign in again.', 'missing_token')
  const accessToken = match[1]

  // 3. Authenticate before reading the body, touching the database or calling the provider.
  let signedIn: boolean
  try {
    signedIn = await deps.verifyUser(accessToken)
  } catch {
    return fail(503, 'Could not verify your session. Please try again.', 'auth_unavailable')
  }
  if (!signedIn) return fail(401, 'Please sign in again.', 'invalid_token')

  // 4. Body: hard size cap while streaming (Content-Length can be missing or a lie), then validate.
  const rawBody = await readLimitedBody(req, config.maxBodyBytes)
  if (rawBody === null) return fail(413, 'Request is too large.', 'body_too_large')

  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(rawBody)
  } catch {
    return fail(400, 'Invalid request.', 'bad_json')
  }

  const parsed = parseOutreachRequest(parsedJson)
  if (!parsed.ok) return fail(400, 'Please check the form fields and try again.', 'validation_failed')

  // 5. Quota, enforced in PostgreSQL. Fail closed: if the check errors, the provider is never called.
  let verdict: QuotaVerdict
  try {
    verdict = await deps.consumeQuota(accessToken)
  } catch {
    return fail(500, 'Could not check your usage limit. Please try again.', 'quota_check_failed')
  }

  switch (verdict) {
    case 'allowed':
      break
    case 'hourly_limit':
      return fail(429, 'You have reached your hourly limit for AI drafts. Please try again later.', 'hourly_limit')
    case 'daily_limit':
      return fail(429, 'You have reached your daily limit for AI drafts. Please try again tomorrow.', 'daily_limit')
    case 'global_limit':
      return fail(503, 'AI drafting is temporarily unavailable. Please try again later.', 'global_limit')
    default:
      return fail(401, 'Please sign in again.', 'quota_unauthenticated')
  }

  // 6. Provider call.
  const result = await deps.generate({
    system: buildSystemPrompt(parsed.value),
    user: buildUserPrompt(parsed.value),
  })

  switch (result.kind) {
    case 'ok':
      return finish(200, { message: result.text, requestId }, 'ok')
    case 'blocked':
      return fail(422, 'The AI could not write a message for this input. Try different wording.', 'provider_blocked')
    case 'rate_limited':
      return fail(502, 'The AI service is busy right now. Try again in a minute.', 'provider_rate_limited')
    case 'timeout':
      return fail(504, 'The AI service did not respond in time. Please try again.', 'provider_timeout')
    default:
      return fail(502, 'The AI service is unavailable right now. Please try again shortly.', `provider_${result.kind}`)
  }
}
