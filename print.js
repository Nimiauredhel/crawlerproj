const readline = require('readline')

let verbose = false

function print(text, newline) {
    if (newline || verbose) {
        console.log(text)
    } else {
        readline.clearLine(process.stdout, 0)
        readline.cursorTo(process.stdout, 0, null)
        process.stdout.write(text+'\r')
    }
}

function setVerbose(value){
    verbose = value;
}

module.exports = {
    print,
    setVerbose
}
