const { JSDOM } = require('jsdom')
const util = require('util')
const { print } = require('./print.js')

const outLinks = "outLinks"
const crawlingFormat = "crawling: %s ...\r"
const incrementingFormat = "incrementing link counter: %s ...\r"
let crawling = false
let pages = {};

async function initiateCrawlSync(baseUrlObj) {
    if (crawling) {
        print("Attempted initiating crawl twice ??", false)
        return {}
    }
    crawling = true

    const htmlBody = await fetchHtmlFromUrl(baseUrlObj.href)
    pages = {};

    if (htmlBody) {
        const nextUrls = getUrlsFromHtml(htmlBody, baseUrlObj)

        for (const nextUrl of nextUrls) {
            await crawlPage(baseUrlObj, nextUrl)
        }
    } else {
        print("Invalid webpage.", false)
        process.exit(1)
    }
    print("")
    return pages;
}

async function initiateCrawlAsync(baseUrlObj) {
    if (crawling) {
        print("Attempted initiating crawl twice ??", false)
        return {}
    }
    crawling = true

    const htmlBody = await fetchHtmlFromUrl(baseUrlObj.href)
    pages = {};

    if (htmlBody) {
        const nextUrls = getUrlsFromHtml(htmlBody, baseUrlObj)

        while (crawling) {
            // main website crawling loop
            const promises = []
            while (nextUrls.length > 0) {
                const current = nextUrls.pop()
                const crawlPromise = new Promise((resolve, reject) => crawlPage(baseUrlObj, current))
                crawlPromise.then((result) => {
                    for (link in result) {
                        nextUrls.push(link)
                    }
                })
                promises.push(crawlPromise)
            }
            Promise.allSettled(promises)
            crawling = nextUrls.length > 0
        }
    } else {
        print("Invalid webpage.", false)
        process.exit(1)
    }
    print("")
    return pages;
}

async function crawlPage(baseUrlObj, currentUrl) {
    const currentUrlObj = new URL(currentUrl)

    if (baseUrlObj.hostname !== currentUrlObj.hostname) {
        registerLink(currentUrl, true)
        print("registering outside link ${currentUrl}", false)
        return;
    }

    const seen = registerLink(currentUrl, false)

    if (seen) {
        print(util.format(incrementingFormat, currentUrl), false)
        return;
    } else {
        print(util.format(crawlingFormat, currentUrl), false)
        const htmlBody = await fetchHtmlFromUrl(currentUrl)

        if (htmlBody) {
            const nextUrls = getUrlsFromHtml(htmlBody, baseUrlObj)

            for (const nextUrl of nextUrls) {
                await crawlPage(baseUrlObj, nextUrl)
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
            print("error in fetch with status code: ${response.status} on page ${currentUrl}", false)
            return null
        }

        const contentType = response.headers.get("content-type")

        if (contentType.includes("text/html")) {
            return await response.text();
        } else {
            print("non html response, content type: ${contentType} on page: ${currentUrl}", false)
            return null
        }
    } catch (err) {
        print("error in fetch: ${err.message} on page ${currentUrl}", false)
    }
}

function getUrlsFromHtml(htmlBody, baseUrlObj) {
    const urls = []
    const dom = new JSDOM(htmlBody)
    const linkElements = dom.window.document.querySelectorAll('a')
    for (const linkElement of linkElements) {

        let urlString;

        if (linkElement.href.slice(0, 1) === '/') {
            // relative url
            urlString = `${baseUrlObj.href}${linkElement.href.slice(1)}`
        } else {
            // absolute url
            urlString = linkElement.href
        }

        if (urlString.length <= 0) continue;

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
    initiateCrawlSync,
    initiateCrawlAsync,
    crawlPage,
    normalizeUrl,
    getUrlsFromHtml
}
