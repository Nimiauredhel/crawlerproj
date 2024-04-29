const { JSDOM } = require('jsdom')
const util = require('util')

const outLinks = "outLinks"
const crawlingFormat = "crawling: %s ...\r"
let crawling = false
let pages = {};


async function initiateCrawl(baseUrlObj) {
    if (crawling) {
        process.stdout.clearLine()
        process.stdout.write("Attempted initiating crawl twice ??\r")
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
        process.stdout.clearLine()
        process.stdout.write("Invalid webpage.\r")
        process.exit(1)
    }
    process.stdout.clearLine()
    return pages;
}

async function crawlPage(baseUrlObj, currentUrl) {
    const currentUrlObj = new URL(currentUrl)

    if (baseUrlObj.hostname !== currentUrlObj.hostname) {
        registerLink(currentUrl, true)
        process.stdout.clearLine()
        process.stdout.write("registering outside link ${currentUrl} \r")
        return;
    }

    registerLink(currentUrl, false)

    process.stdout.clearLine()
    process.stdout.write(util.format(crawlingFormat, currentUrl))

    const htmlBody = await fetchHtmlFromUrl(currentUrl)

    if (htmlBody) {
        const nextUrls = getUrlsFromHtml(htmlBody, baseUrlObj)

        for (const nextUrl of nextUrls) {
            await crawlPage(baseUrlObj, nextUrl)
        }
    }
}

function registerLink(currentUrl, external) {
    const normalizedUrl = normalizeUrl(currentUrl)
    if (external) {
        if (!pages[outLinks]) {
            pages[outLinks] = {}
        }
        if (pages[outLinks][currentUrl]) {
            pages[outLinks][currentUrl]++
        } else {
            pages[outLinks][currentUrl] = 1
        }
    } else {
        if (pages[normalizedUrl] > 0) {
            pages[normalizedUrl]++
        } else {
            pages[normalizedUrl] = 1
        }
    }
}

async function fetchHtmlFromUrl(currentUrl) {
    try {
        const response = await fetch(currentUrl)

        if (response.status > 399) {
            process.stdout.clearLine()
            process.stdout.write("error in fetch with status code: ${response.status} on page ${currentUrl}\r")
            return null
        }

        const contentType = response.headers.get("content-type")

        if (contentType.includes("text/html")) {
            return await response.text();
        } else {
            process.stdout.clearLine()
            process.stdout.write("non html response, content type: ${contentType} on page: ${currentUrl}\r")
            return null
        }
    } catch (err) {
        process.stdout.clearLine()
        process.stdout.write("error in fetch: ${err.message} on page ${currentUrl}\r")
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
            process.stdout.clearLine()
            process.stdout.write(`error with url: ${err.message}\r`)
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
    crawlPage,
    normalizeUrl,
    getUrlsFromHtml
}
