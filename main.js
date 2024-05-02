const { initiateCrawl, setAsync, setBaseUrl } = require('./crawl.js')
const { formatReport } = require('./report.js')
const { print, setVerbose } = require('./print.js')

async function main() {
    if (process.argv.length < 3) {
        print("insufficient input", true)
        process.exit(1)
    } else if (process.argv.length == 4) {
        if (process.argv[3] == 'sync') {
            setAsync(false)
        } else if (process.argv[3] == 'async') {
            setAsync(true)
        } else if (process.argv[3] == 'verbose') {
            setVerbose(true)
        } else {
            print("invalid input, did you mean \'sync\' or \'async'\ or \'verbose\'?", true)
            process.exit(1)
        }
    } else if (process.argv.length > 4) {
        print("too many inputs", true)
        process.exit(1)
    }

    try {
        setBaseUrl(process.argv[2])
    } catch (err) {
        print(`error with base url: ${err.message}`, true)
        process.exit(1)
    }

    const pages = await initiateCrawl()
    const report = formatReport(pages)
    print(report, true)
    process.exit(0)
}

main()

