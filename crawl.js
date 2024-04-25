const { JSDOM } = require('jsdom')

async function crawlPage(baseUrl, currentUrl, pages) {
    const baseUrlObj = new URL(baseUrl)
    const currentUrlObj = new URL(currentUrl)

    if (baseUrlObj.hostname !== currentUrlObj.hostname) {
        return pages;
    }

    const normalizedUrl = normalizeUrl(currentUrl)

    if (pages[normalizedUrl] > 0) {
        pages[normalizedUrl]++
        return pages;
    }

    console.log(`crawling: ${currentUrl} ...`)
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
            const nextUrls = getUrlsFromHtml(htmlBody, baseUrl)

            for (const nextUrl of nextUrls) {
                pages = await crawlPage(baseUrl, nextUrl, pages)
            }
        } else {
            console.log(`non html response, content type: ${contentType} on page: ${currentUrl}`)
        }
    } catch (err) {
        console.log(`error in fetch: ${err.message} on page ${currentUrl}`)
    }

    return pages;
}

function getUrlsFromHtml(htmlBody, baseUrl) {
    const urls = []
    const dom = new JSDOM(htmlBody)
    const linkElements = dom.window.document.querySelectorAll('a')
    for (const linkElement of linkElements) {

        let urlString;

        if (linkElement.href.slice(0, 1) === '/') {
            // relative url
            urlString = `${baseUrl}${linkElement.href}`
        } else {
            // absolute url
            urlString = linkElement.href
        }
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
    crawlPage,
    normalizeUrl,
    getUrlsFromHtml

}
