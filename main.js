const { initiateCrawl } = require('./crawl.js')
const { formatReport } = require('./report.js')

async function main() {
    if (process.argv.length < 3) {
        console.log("insufficient input")
        process.exit(1)
    } else if (process.argv.length > 3) {
        console.log("too many inputs")
        process.exit(1)
    }

    const baseUrl = process.argv[2]

    console.log(`starting crawl at: ${baseUrl}`)
    const pages = await initiateCrawl(baseUrl)
    const report = formatReport(pages)
    console.log(report)
    process.exit(0)
}

main()
