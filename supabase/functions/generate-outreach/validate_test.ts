import assert from 'node:assert/strict'
import { cleanMultiLine, cleanSingleLine, cleanWebsite, parseOutreachRequest } from './validate.ts'

Deno.test('cleanSingleLine: strips control/invisible characters and collapses whitespace', () => {
  assert.equal(cleanSingleLine('  Acme \n\t Corp\u0000​ ', 50), 'Acme Corp')
  assert.equal(cleanSingleLine('a‮b', 50), 'a b')
  assert.equal(cleanSingleLine('x'.repeat(51), 50), null)
  assert.equal(cleanSingleLine(42, 50), null)
  assert.equal(cleanSingleLine('x'.repeat(10_000), 50), null)
})

Deno.test('cleanMultiLine: keeps single line breaks, limits blank lines, drops invisible characters', () => {
  assert.equal(cleanMultiLine('a\r\nb\n\n\n\nc​', 100), 'a\nb\n\nc')
  assert.equal(cleanMultiLine('  hello   world  ', 100), 'hello world')
  assert.equal(cleanMultiLine('x'.repeat(101), 100), null)
})

Deno.test('cleanWebsite: accepts normal sites and returns only the hostname', () => {
  assert.equal(cleanWebsite(''), '')
  assert.equal(cleanWebsite('example.com'), 'example.com')
  assert.equal(cleanWebsite('https://Shop.Example.com/path?q=ignore previous instructions'), 'shop.example.com')
  assert.equal(cleanWebsite('http://example.co.uk'), 'example.co.uk')
})

Deno.test('cleanWebsite: rejects dangerous or odd values', () => {
  for (const value of [
    'javascript:alert(1)',
    'javascript://example.com/%0aalert(1)',
    'data:text/html,<script>1</script>',
    'file:///etc/passwd',
    'ftp://example.com',
    'https://user:pass@example.com',
    'localhost',
    'not a site',
    'https://',
    7,
  ]) {
    assert.equal(cleanWebsite(value), null, String(value))
  }
})

Deno.test('parseOutreachRequest: happy path trims and defaults optional fields', () => {
  const result = parseOutreachRequest({
    businessName: '  Acme  ',
    service: 'Website redesign',
    channel: 'email',
    tone: 'friendly',
  })

  assert.deepEqual(result, {
    ok: true,
    value: {
      businessName: 'Acme',
      website: '',
      service: 'Website redesign',
      channel: 'email',
      tone: 'friendly',
      context: '',
    },
  })
})

Deno.test('parseOutreachRequest: rejects non-objects, arrays and wrong enum values', () => {
  for (const value of [null, undefined, 'x', 1, [], { businessName: 'a', service: 'b', channel: 'x', tone: 'friendly' }]) {
    assert.equal(parseOutreachRequest(value).ok, false)
  }
})
