const { initiateCrawl } = require('./crawl.js')
const { formatReport } = require('./report.js')
const { print } = require('./print.js')

async function main() {
    if (process.argv.length < 3) {
        console.log("insufficient input")
        process.exit(1)
    } else if (process.argv.length > 3) {
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

    print("", true);
    print(`starting crawl at: ${baseUrl}`, false);
    const pages = await initiateCrawl(baseUrlObj)
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
