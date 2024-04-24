const { JSDOM } = require('jsdom')

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
            console.log('error with url: ${err.message}')
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
    normalizeUrl,
    getUrlsFromHtml

}
