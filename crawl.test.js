const { normalizeUrl, getUrlsFromHtml } = require('./crawl.js')

const { test, expect } = require('@jest/globals')

test('normalizeUrl strip protocol', () => {
    const input = 'https://blog.boot.dev/path'
    const actual = normalizeUrl(input)
    const expected = 'blog.boot.dev/path'

    expect(actual).toEqual(expected)
})

test('normalizeUrl trailing slash', () => {
    const input = 'https://blog.boot.dev/path/'
    const actual = normalizeUrl(input)
    const expected = 'blog.boot.dev/path'

    expect(actual).toEqual(expected)
})

test('normalizeUrl capitals', () => {
    const input = 'https://BLOG.boot.dev/path'
    const actual = normalizeUrl(input)
    const expected = 'blog.boot.dev/path'

    expect(actual).toEqual(expected)
})

test('normalizeUrl strip http', () => {
    const input = 'http://BLOG.boot.dev/path'
    const actual = normalizeUrl(input)
    const expected = 'blog.boot.dev/path'

    expect(actual).toEqual(expected)
})

test('getUrlsFromHtml absolute', () => {
    const inputHtmlBody =
`<html>
        <body>
        <a href="https://blog.boot.dev/path/">
        Boot.dev blog
        </a>
        </body>
</html>`
    const inputBaseUrl = "https://blog.boot.dev/"
    const actual = getUrlsFromHtml(inputHtmlBody, inputBaseUrl)
    const expected = ["https://blog.boot.dev/path/"]
    expect(actual).toEqual(expected)
})

test('getUrlsFromHtml relative', () => {
    const inputHtmlBody =
`<html>
        <body>
        <a href="/path/">
        Boot.dev blog
        </a>
        </body>
</html>`
    const inputBaseUrl = "https://blog.boot.dev"
    const actual = getUrlsFromHtml(inputHtmlBody, inputBaseUrl)
    const expected = ["https://blog.boot.dev/path/"]
    expect(actual).toEqual(expected)
})

test('getUrlsFromHtml multiple', () => {
    const inputHtmlBody =
`<html>
        <body>
        <a href="/path1/">
        Boot.dev blog path one
        </a>
        <a href="https://blog.boot.dev/path2/">
        Boot.dev blog path two
        </a>
        </body>
</html>`
    const inputBaseUrl = "https://blog.boot.dev"
    const actual = getUrlsFromHtml(inputHtmlBody, inputBaseUrl)
    const expected = ["https://blog.boot.dev/path1/","https://blog.boot.dev/path2/"]
    expect(actual).toEqual(expected)
})

test('getUrlsFromHtml invalid', () => {
    const inputHtmlBody =
`<html>
        <body>
        <a href="invalid">
        Boot.dev blog
        </a>
        </body>
</html>`
    const inputBaseUrl = "https://blog.boot.dev"
    const actual = getUrlsFromHtml(inputHtmlBody, inputBaseUrl)
    const expected = []
    expect(actual).toEqual(expected)
})
