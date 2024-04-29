const readline = require('readline')

function print(text, newline) {
    if (!newline) {
        readline.clearLine(process.stdout, 0)
        readline.cursorTo(process.stdout, 0, null)
    }
    process.stdout.write(text)
}

module.exports = {
    print
}
