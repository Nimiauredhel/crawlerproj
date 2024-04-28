function formatReport(pages) {
    let report = `
================
     REPORT
================
`
    if (pages.length > 0) {
        const sortedPages = sortPages(pages)
        for (const sortedPage of sortedPages) {
            const url = sortedPage[0]
            const hits = sortedPage[1]
            report = report.concat(`\n Found ${hits} links to page: ${url} `)
        }
    } else {
        report = report.concat(`
     EMPTY
     REPORT`)
    }
    report = report.concat(`

================
   END REPORT
================`)

    return report;
}

function sortPages(pages) {
    const pagesArr = Object.entries(pages)
    pagesArr.sort((a, b) => {
        return b[1] - a[1]
    })

    return pagesArr
}

module.exports = {
    formatReport,
    sortPages
}
