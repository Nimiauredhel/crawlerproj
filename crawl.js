const { JSDOM } = require('jsdom')
const util = require('util')

const outLinks = "outLinks"
const crawlingFormat = "crawling: %s ...\r"
let crawling = false


async function initiateCrawl(baseUrlObj) {
    if (crawling) {
        console.log("Attempted initiating crawl twice ??")
        return {}
    }
    const pages = await crawlPage(baseUrlObj, baseUrlObj.href, {})
    process.stdout.clearLine()
    return pages;
}

async function crawlPage(baseUrlObj, currentUrl, pages) {
    const currentUrlObj = new URL(currentUrl)

    if (baseUrlObj.hostname !== currentUrlObj.hostname) {
        if (!pages[outLinks]) {
            pages[outLinks] = {}
        }
        if (pages[outLinks][currentUrl]) {
            pages[outLinks][currentUrl]++
        } else {
            pages[outLinks][currentUrl] = 1
        }
        return pages;
    }

    const normalizedUrl = normalizeUrl(currentUrl)

    if (pages[normalizedUrl] > 0) {
        pages[normalizedUrl]++
        return pages;
    }

    process.stdout.clearLine()
    process.stdout.write(util.format(crawlingFormat, currentUrl))
    pages[normalizedUrl] = 1

    try {
        const response = await fetch(currentUrl)

        if (response.status > 399) {
            console.log(`error in fetch with status code: ${response.status} on page ${currentUrl}`)
            return pages
        }

        const contentType = response.headers.get("content-type")

        if (contentType.includes("text/html")) {

            const htmlBody = await response.text();
            const nextUrls = getUrlsFromHtml(htmlBody, baseUrlObj)

            for (const nextUrl of nextUrls) {
                pages = await crawlPage(baseUrlObj, nextUrl, pages)
            }
        } else {
            console.log(`non html response, content type: ${contentType} on page: ${currentUrl}`)
        }
    } catch (err) {
        console.log(`error in fetch: ${err.message} on page ${currentUrl}`)
    }

    return pages;
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
            console.log(`error with url: ${err.message}`)
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
