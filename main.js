const { initiateCrawlSync, initiateCrawlAsync } = require('./crawl.js')
const { formatReport } = require('./report.js')
const { print, setVerbose } = require('./print.js')

async function main() {
    let crawlAsync = true

    if (process.argv.length < 3) {
        console.log("insufficient input")
        process.exit(1)
    } else if (process.argv.length == 4) {
        const asyncParam = process.argv[3]
        if (asyncParam == 'sync') {
            crawlAsync = false
        } else if (asyncParam == 'async') {
            crawlAsync = true
        } else if (asyncParam == 'verbose') {
            setVerbose(true)
        } else {
            console.log("invalid input, did you mean \'sync\' or \'async'\ or \'verbose\'?")
            process.exit(1)
        }
    } else if (process.argv.length > 4) {
        console.log("too many inputs")
        process.exit(1)
    }

    const baseUrl = validateBaseUrl(process.argv[2])
    let baseUrlObj;

    try {
        baseUrlObj = new URL(baseUrl)
    } catch (err) {
        console.log(`error with base url: ${err.message}`)
        process.exit(1)
    }

    console.log(`\nstarting crawl at: ${baseUrl}\n`);
    let pages
    if (crawlAsync) {
        pages = await initiateCrawlAsync(baseUrlObj)
    } else {
        pages = await initiateCrawlSync(baseUrlObj)
    }
    const report = formatReport(pages)
    console.log(report)
    process.exit(0)
}

function validateBaseUrl(baseUrl) {
    if (baseUrl.slice(0, 4) === 'http') {
        return baseUrl;
    } else {
        return `https://${baseUrl}`
    }
}

main()

