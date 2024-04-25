const { JSDOM } = require('jsdom')

async function crawlPage(currentUrl) {
    console.log(`crawling: ${currentUrl} ...`)
    try {
        const response = await fetch(currentUrl)

        if (response.status > 399) {
            console.log(`error in fetch with status code: ${response.status} on page ${currentUrl}`)
            return;
        }
        const contentType = response.headers.get("content-type")
        if (contentType.includes("text/html")) {
            console.log(await response.text())
        } else {
            console.log(`non html response, content type: ${contentType} on page: ${currentUrl}`)
        }
    } catch (err) {
        console.log(`error in fetch: ${err.message} on page ${currentUrl}`)
    }
}

function getUrlsFromHtml(htmlBody, baseUrl){
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
            const urlObj = new URL(urlString)$
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
