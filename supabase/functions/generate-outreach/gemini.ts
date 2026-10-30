export type GeminiResult =
  | { kind: 'ok'; text: string }
  | { kind: 'blocked' }
  | { kind: 'rate_limited' }
  | { kind: 'provider_error'; status: number }
  | { kind: 'timeout' }
  | { kind: 'network_error' }
  | { kind: 'bad_response' }
  | { kind: 'empty' }

export interface GeminiConfig {
  apiKey: string
  model: string
  timeoutMs: number
  maxOutputChars: number
}

export interface Prompt {
  system: string
  user: string
}

const MAX_RESPONSE_CHARS = 200_000

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && (error.name === 'TimeoutError' || error.name === 'AbortError')
}

interface GeminiPart {
  text?: unknown
  thought?: unknown
}

function extractText(payload: unknown): { blocked: boolean; text: string } | null {
  if (typeof payload !== 'object' || payload === null) return null
  const body = payload as {
    promptFeedback?: { blockReason?: unknown }
    candidates?: Array<{ finishReason?: unknown; content?: { parts?: GeminiPart[] } }>
  }

  if (body.promptFeedback?.blockReason !== undefined) return { blocked: true, text: '' }

  const candidate = Array.isArray(body.candidates) ? body.candidates[0] : undefined
  if (candidate?.finishReason === 'SAFETY' || candidate?.finishReason === 'PROHIBITED_CONTENT') {
    return { blocked: true, text: '' }
  }

  const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : []
  const text = parts
    .filter((part) => part.thought !== true && typeof part.text === 'string')
    .map((part) => part.text as string)
    .join('')
    .trim()

  return { blocked: false, text }
}

// Never throws. The provider's response body is never returned to callers (it is not logged or
// forwarded either), so provider errors cannot leak details to users or into logs.
export async function callGemini(
  fetchFn: typeof fetch,
  config: GeminiConfig,
  prompt: Prompt,
): Promise<GeminiResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent`

  let response: Response
  try {
    response = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: prompt.system }] },
        contents: [{ role: 'user', parts: [{ text: prompt.user }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
      }),
      signal: AbortSignal.timeout(config.timeoutMs),
    })
  } catch (error) {
    return isAbort(error) ? { kind: 'timeout' } : { kind: 'network_error' }
  }

  if (!response.ok) {
    await response.body?.cancel().catch(() => undefined)
    return response.status === 429
      ? { kind: 'rate_limited' }
      : { kind: 'provider_error', status: response.status }
  }

  let raw: string
  try {
    raw = await response.text()
  } catch (error) {
    return isAbort(error) ? { kind: 'timeout' } : { kind: 'network_error' }
  }
  if (raw.length > MAX_RESPONSE_CHARS) return { kind: 'bad_response' }

  let payload: unknown
  try {
    payload = JSON.parse(raw)
  } catch {
    return { kind: 'bad_response' }
  }

  const extracted = extractText(payload)
  if (extracted === null) return { kind: 'bad_response' }
  if (extracted.blocked) return { kind: 'blocked' }
  if (extracted.text === '') return { kind: 'empty' }

  return { kind: 'ok', text: extracted.text.slice(0, config.maxOutputChars) }
}
