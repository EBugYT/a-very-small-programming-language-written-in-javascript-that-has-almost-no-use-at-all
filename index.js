var fs = require("fs")

var args = process.argv.slice(2);
var file = fs.readFileSync(args[0], { encoding: 'utf8', flag: 'r' })

// Parser logic (very hard to make and unreadable)
// sorry

file = file.split("")

var tokens = []
var token = ""
var inString = false
var wasNewLine = false

for (let i = 0; i < file.length + 1; i++) {
    const el = file[i];
    if (wasNewLine && el == "n") {
        tokens.push(token)
        token = ""
        wasNewLine = false
    } else if (wasNewLine) {
        wasNewLine = false
    }
    if (el == "\\") {
        wasNewLine = true
    }
    if (el == "\"") {
        inString = !inString
    }
    if (el == " " && !inString) {
        tokens.push(token)
        token = ""
    } else if (!el) {
        tokens.push(token)
        token = ""
    } else {
        token += el
    }
}

tokens.forEach((el, i) => {
    if (el.includes("\n")) {
        el = el.split("\n").reduce((acc, curr, index) => {
            if (index !== 0) {
                acc.push("EOL");
            }
            acc.push(curr);
            return acc;
        }, []);
        tokens.splice(i, 1)
        var part1 = tokens.slice(0, i)
        var part2 = tokens.slice(i)
        tokens = part1.concat(el, part2)
    }
});

tokens = tokens.map((el) => {
    if (el == "\n") {
        return "EOL"
    } else {
        return el
    }
})

console.log(tokens)

// Now the part i love the most (this is irony not like fr like who likes this part)

var variables = {}

var checkpoints = {}

var programCounter = 0;

function setVar(varname, value) {
    variables[varname] = value
}

function getVar(varname) {
    return variables[varname]
}

function printVar(varname) {
    console.log(getVar(varname))
}

function add(var1, var2, outvar) {
    setVar(outvar, getVar(var1) + getVar(var2))
}

function subt(var1, var2, outvar) {
    setVar(outvar, getVar(var1) + getVar(var2))
}

function mul(var1, var2, outvar) {
    setVar(outvar, getVar(var1) + getVar(var2))
}

function div(var1, var2, outvar) {
    setVar(outvar, getVar(var1) + getVar(var2))
}

function checkpoint(name) {
    checkpoints[name] = programCounter
}

function goto(name) {
    programCounter = checkpoints[name]
}

function halt() {
    process.exit();
}

function read(outvar) {
    var readline = require('readline').createInterface(process.stdin, process.stdout)
    readline.setPrompt('');
    readline.prompt()
    readline.on('line', function(line) {
        setVar(outvar, line)
        readline.close()
    })
}

function gotoIfZero(var1,checkpoint) {
    if(getVar(var1) == 0) {
        goto(checkpoint)
    } 
}

function gotoIfGTZero(var1,checkpoint) {
    if(getVar(var1) > 0) {
        goto(checkpoint)
    } 
}

// Now parsing, yay

