const readline = require('readline')

let verbose = false

function print(text, newline) {
    if (verbose) {
        console.log(text)
    } else {
        if (newline) {
            process.stdout.write(text)
            process.stdout.write('\n')
        } else {
            process.stdout.clearLine()
            process.stdout.write('\r')
            process.stdout.write(text)
        }
    }
}

function setVerbose(value) {
    verbose = value;
}

module.exports = {
    print,
    setVerbose
}
