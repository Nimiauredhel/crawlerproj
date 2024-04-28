const outLinks = "outLinks"

function formatReport(pages) {
    let report = `
 ================
      REPORT
 ================
`
    const externalLinks = {}
    Object.assign(externalLinks, pages[outLinks])
    delete pages[outLinks]

    let sortedPages = sortPages(pages)
    if (sortedPages.length > 0) {
        report = report.concat(`
  Internal Links:
        `)
        for (const sortedPage of sortedPages) {
            const url = sortedPage[0]
            const hits = sortedPage[1]
            report = report.concat(`\n Found ${hits} links to page: ${url} `)
        }
        sortedPages = sortPages(externalLinks)
        if (sortedPages.length > 0) {
            report = report.concat(`

  External Links:
        `)
            for (const sortedPage of sortedPages) {
                const url = sortedPage[0]
                const hits = sortedPage[1]
                report = report.concat(`\n Found ${hits} links to page: ${url} `)
            }
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
