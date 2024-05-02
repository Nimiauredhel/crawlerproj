const { JSDOM } = require('jsdom')
const util = require('util')
const { print } = require('./print.js')

const aboutBlank = 'about:blank'
const outLinks = "outLinks"
const crawlingFormat = `crawling: %s`
const incrementingFormat = `incrementing link counter: %s`
let crawling = false
let isAsync = true
let baseUrlObject
let pages = {};

function setAsync(value) {
    isAsync = value
}

function setBaseUrl(value) {
    const baseUrl = validateBaseUrl(value)
    baseUrlObject = new URL(baseUrl)
}

function validateBaseUrl(baseUrl) {
    if (baseUrl.slice(0, 4) === 'http') {
        return baseUrl;
    } else {
        return `https://${baseUrl}`
    }
}

async function initiateCrawl() {
    if (crawling) {
        print("Attempted initiating crawl twice ??", false)
        return {}
    }

    print(`starting crawl at: ${baseUrlObject.href}`, true);
    crawling = true
    pages = {};

    await crawlSite()
    print('', false)

    return pages;
}

async function crawlSite() {
    const htmlBody = await fetchHtmlFromUrl(baseUrlObject.href)
    if (htmlBody) {
        const nextUrls = getUrlsFromHtml(htmlBody)
        if (isAsync) {
            while (crawling) {
                // main website crawling loop
                const promises = []

                while (nextUrls.length > 0) {
                    const current = nextUrls.pop()
                    const crawlPromise = new Promise((resolve) =>
                        resolve(crawlPage(current)));
                    promises.push(crawlPromise)
                }

                await Promise.allSettled(promises).then((results) =>
                    results.forEach((result => {
                        if (result.value != null) {
                            const count = result.value.length
                            let index = 0
                            for (index = 0; index < count; index++) {
                                nextUrls.push(result.value[index])
                            }
                        }
                    })))
                crawling = nextUrls.length > 0
            }
        } else {
            for (const current of nextUrls) {
                await crawlPage(current)
            }
        }
    } else {
        print(`Invalid home page at ${baseUrlObject.href}`, false)
        process.exit(1)
    }
}

async function crawlPage(currentUrl) {
    let currentUrlObject
    try {
        currentUrlObject = new URL(currentUrl)
    } catch {
        print(`invalid link: ${currentUrl}`, false)
        return null
    }

    if (baseUrlObject.hostname !== currentUrlObject.hostname) {
        registerLink(currentUrl, true)
        print(`registering outside link ${currentUrl}`, false)
        return null
    }

    const seen = registerLink(currentUrl, false)

    if (seen) {
        print(util.format(incrementingFormat, currentUrl), false)
        return null
    } else {
        print(util.format(crawlingFormat, currentUrl), false)
        const htmlBody = await fetchHtmlFromUrl(currentUrl)

        if (htmlBody) {
            const nextUrls = getUrlsFromHtml(htmlBody)
            // if doing async crawling, return the urls to the calling function
            // if doing sync crawling, recurse!
            if (isAsync) {
                return nextUrls
            } else {
                for (const nextUrl of nextUrls) {
                    await crawlPage(nextUrl)
                }
            }
        }
    }
}

function registerLink(currentUrl, external) {
    const normalizedUrl = normalizeUrl(currentUrl)
    let seen = false
    if (external) {
        if (!pages[outLinks]) {
            pages[outLinks] = {}
        }
        if (pages[outLinks][currentUrl]) {
            pages[outLinks][currentUrl]++
            seen = true;
        } else {
            pages[outLinks][currentUrl] = 1
        }
    } else {
        if (pages[normalizedUrl] > 0) {
            pages[normalizedUrl]++
            seen = true;
        } else {
            pages[normalizedUrl] = 1
        }
    }
    return seen;
}

async function fetchHtmlFromUrl(currentUrl) {
    try {
        const response = await fetch(currentUrl)
        if (response.status > 399) {
            print(`error in fetch with status code: ${response.status} on page ${currentUrl}`, false)
            return null
        }
        const contentType = response.headers.get("content-type")
        if (contentType.includes("text/html")) {
            return await response.text();
        } else {
            print(`non html response, content type: ${contentType} on page: ${currentUrl}`, false)
            return null
        }
    } catch (err) {
        print(`error in fetch: ${err.message} on page ${currentUrl}`, false)
    }
}

function getUrlsFromHtml(htmlBody) {
    const urls = []
    const dom = new JSDOM(htmlBody)
    const linkElements = dom.window.document.querySelectorAll('a')
    for (const linkElement of linkElements) {
        let urlString;
        if (linkElement.href.slice(0, 1) === '/') {
            // relative url
            urlString = `${baseUrlObject.href}${linkElement.href.slice(1)}`
        } else {
            // absolute url
            urlString = linkElement.href
        }
        if (urlString.length <= 0) continue;
        if (urlString.includes(aboutBlank)) {
            print(`link to blank page: ${urlString}`, false)
            continue
        }
        try {
            const urlObj = new URL(urlString)
            urls.push(urlString)
        } catch (err) {
            print(`error with url: ${err.message}`, false)
        }
    }
    return urls
}

function normalizeUrl(urlString) {
    const urlObj = new URL(urlString)
    const hostpath = `${urlObj.hostname}${urlObj.pathname}`
    if (hostpath.length > 0 && hostpath.slice(-1) === '/') {
        return hostpath.slice(0, -1)
    }
    return hostpath;
}

module.exports = {
    initiateCrawl,
    normalizeUrl,
    getUrlsFromHtml,
    setAsync,
    setBaseUrl
}
