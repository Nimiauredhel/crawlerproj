const { crawlPage } = require('./crawl.js')

async function main() {
    if (process.argv.length < 3) {
        console.log("insufficient input")
        process.exit(1)
    }else if (process.argv.length > 3) {
        console.log("too many inputs")
        process.exit(1)
    }
   
    const baseUrl = process.argv[2]

    console.log(`starting crawl at: ${baseUrl}`)
    const pages = await crawlPage(baseUrl, baseUrl, {})

    for (const page of Object.entries(pages)){
        console.log(page)
    }

    process.exit(0)
}

main()
