import assert from 'node:assert/strict'
import { callGemini } from './gemini.ts'
import type { GeminiConfig } from './gemini.ts'

const config: GeminiConfig = {
  apiKey: 'FAKE-GEMINI-KEY-1234567890',
  model: 'some-model-id',
  timeoutMs: 80,
  maxOutputChars: 50,
}
const prompt = { system: 'SYSTEM', user: 'USER' }

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const okBody = (text: string) => ({ candidates: [{ content: { parts: [{ text }] } }] })

Deno.test('request: key goes in a header (never the URL); only system + user prompt are sent', async () => {
  let seenUrl = ''
  let seenInit: RequestInit | undefined

  const result = await callGemini(
    (input, init) => {
      seenUrl = String(input)
      seenInit = init
      return Promise.resolve(jsonResponse(okBody('hello')))
    },
    config,
    prompt,
  )

  assert.deepEqual(result, { kind: 'ok', text: 'hello' })
  assert.ok(seenUrl.endsWith('/models/some-model-id:generateContent'))
  assert.ok(!seenUrl.includes(config.apiKey))
  assert.equal((seenInit?.headers as Record<string, string>)['x-goog-api-key'], config.apiKey)
  assert.ok(seenInit?.signal instanceof AbortSignal, 'a timeout signal is attached')

  const sent = JSON.parse(String(seenInit?.body)) as Record<string, unknown>
  assert.deepEqual(Object.keys(sent).sort(), ['contents', 'generationConfig', 'systemInstruction'])
  assert.equal(sent.tools, undefined, 'the model is given no tools')
})

Deno.test('model id is URL-encoded', async () => {
  let seenUrl = ''
  await callGemini(
    (input) => {
      seenUrl = String(input)
      return Promise.resolve(jsonResponse(okBody('x')))
    },
    { ...config, model: 'a/b?c=d' },
    prompt,
  )
  assert.ok(seenUrl.includes('/models/a%2Fb%3Fc%3Dd:generateContent'))
})

Deno.test('provider failure: timeout (provider hangs) -> timeout', async () => {
  const hang: typeof fetch = (_input, init) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(init.signal?.reason))
    })

  const started = performance.now()
  const result = await callGemini(hang, config, prompt)

  assert.deepEqual(result, { kind: 'timeout' })
  assert.ok(performance.now() - started < 2000, 'gave up quickly instead of hanging')
})

Deno.test('provider failure: body stalls after headers -> timeout', async () => {
  const stall: typeof fetch = (_input, init) => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        init?.signal?.addEventListener('abort', () => controller.error(init.signal?.reason))
      },
    })
    return Promise.resolve(new Response(body, { status: 200 }))
  }

  assert.deepEqual(await callGemini(stall, config, prompt), { kind: 'timeout' })
})

Deno.test('provider failure: network error', async () => {
  const result = await callGemini(() => Promise.reject(new TypeError('connection refused')), config, prompt)
  assert.deepEqual(result, { kind: 'network_error' })
})

Deno.test('provider failure: HTTP 429 -> rate_limited; 500/503/404 -> provider_error with status only', async () => {
  const secretInBody = 'PROVIDER-SECRET-DETAILS'

  assert.deepEqual(
    await callGemini(() => Promise.resolve(jsonResponse({ error: secretInBody }, 429)), config, prompt),
    { kind: 'rate_limited' },
  )

  for (const status of [500, 503, 404, 400]) {
    const result = await callGemini(() => Promise.resolve(jsonResponse({ error: secretInBody }, status)), config, prompt)
    assert.deepEqual(result, { kind: 'provider_error', status })
    assert.ok(!JSON.stringify(result).includes(secretInBody), 'provider error text is never returned')
  }
})

Deno.test('provider failure: malformed, oversized and unexpected responses -> bad_response', async () => {
  assert.deepEqual(
    await callGemini(() => Promise.resolve(new Response('<html>oops</html>', { status: 200 })), config, prompt),
    { kind: 'bad_response' },
  )
  assert.deepEqual(
    await callGemini(() => Promise.resolve(new Response('x'.repeat(250_000), { status: 200 })), config, prompt),
    { kind: 'bad_response' },
  )
  assert.deepEqual(
    await callGemini(() => Promise.resolve(jsonResponse('just a string')), config, prompt),
    { kind: 'bad_response' },
  )
})

Deno.test('provider failure: safety blocks and empty output', async () => {
  assert.deepEqual(
    await callGemini(() => Promise.resolve(jsonResponse({ promptFeedback: { blockReason: 'SAFETY' } })), config, prompt),
    { kind: 'blocked' },
  )
  assert.deepEqual(
    await callGemini(
      () => Promise.resolve(jsonResponse({ candidates: [{ finishReason: 'SAFETY' }] })),
      config,
      prompt,
    ),
    { kind: 'blocked' },
  )
  assert.deepEqual(await callGemini(() => Promise.resolve(jsonResponse({ candidates: [] })), config, prompt), {
    kind: 'empty',
  })
  assert.deepEqual(await callGemini(() => Promise.resolve(jsonResponse(okBody('   '))), config, prompt), {
    kind: 'empty',
  })
})

Deno.test('output: thought parts are dropped and the result is capped', async () => {
  const body = {
    candidates: [{ content: { parts: [{ text: 'secret reasoning', thought: true }, { text: 'a'.repeat(200) }] } }],
  }
  const result = await callGemini(() => Promise.resolve(jsonResponse(body)), config, prompt)

  assert.equal(result.kind, 'ok')
  if (result.kind === 'ok') {
    assert.equal(result.text.length, config.maxOutputChars)
    assert.ok(!result.text.includes('secret reasoning'))
  }
})
