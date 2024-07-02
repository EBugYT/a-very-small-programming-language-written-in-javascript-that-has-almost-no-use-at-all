var fs = require("fs")

var args = process.argv.slice(2);
var file = fs.readFileSync(args[0] + ".thatlang", { encoding: 'utf8', flag: 'r' })

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
    readline.on('line', function (line) {
        setVar(outvar, line)
        readline.close()
        commandRunning = false;
    })
}

function gotoIfZero(var1, checkpoint) {
    if (getVar(var1) == 0) {
        goto(checkpoint)
    }
}

function gotoIfGTZero(var1, checkpoint) {
    if (getVar(var1) > 0) {
        goto(checkpoint)
    }
}

// Now parsing, yay

var commands = []
var command = []
tokens.forEach(el => {
    if (el == "EOL") {
        commands.push(command)
        command = []
    } else {
        command.push(el)
    }
});

commands.push(command)
command = []

function strip1(text) {
    return text.slice(1, -1)
}

function isString(text) {
    return text.startsWith("\"") && text.endsWith("\"")
}

var commandRunning = false

commands.forEach(command => {
    if (command[0] == "CHECKPOINT") {
        checkpoint(strip1(command[1]))
    }
});

function runCommand() {
    command = commands[programCounter]
    if (command[0] == "CHECKPOINT") {
        checkpoint(strip1(command[1]))
    } else if (command[0] == "GOTO") {
        goto(strip1(command[1]))
    } else if (command[0] == "SETVAR") {
        if (isString(command[2])) {
            setVar(strip1(command[1]), strip1(command[2]))
        } else if (["true", "false"].includes(command[2])) {
            if (command[2] == "true") {
                setVar(strip1(command[1]), true)
            } else {
                setVar(strip1(command[1]), false)
            }
        } else {
            setVar(strip1(command[1]), parseFloat(command[2]))
        }
    } else if (command[0] == "PRINTVAR") {
        printVar(strip1(command[1]))
    } else if (command[0] == "PRINT") {
        console.log(strip1(command[1]))
    } else if (command[0] == "READ") {
        setVar(command[1], read(strip1(command[1])))
    } else if (command[0] == "READNUM") {
        setVar(command[1], parseFloat(read(strip1(command[1]))))
    } else if (command[0] == "ADD") {
        add(strip1(command[1]), strip1(command[2]), strip1(command[3]))
    } else if (command[0] == "SUBT") {
        subt(strip1(command[1]), strip1(command[2]), strip1(command[3]))
    } else if (command[0] == "MUL") {
        mul(strip1(command[1]), strip1(command[2]), strip1(command[3]))
    } else if (command[0] == "DIV") {
        div(strip1(command[1]), strip1(command[2]), strip1(command[3]))
    } else if (command[0] == "GOTOIFZERO") {
        gotoIfZero(strip1(command[1]), strip1(command[2]))
    } else if (command[0] == "GOTOIFGTZERO") {
        gotoIfGTZero(strip1(command[1]), strip1(command[2]))
    } else if (command[0] == "HALT") {
        halt()
    }
    if (command[0] != "READ") {
        commandRunning = false
    }
}

function runScript() {
    commandRunning = true
    runCommand()
    let interval = setInterval(() => {
        if (commandRunning == false) {
            clearInterval(interval)
            if (programCounter < commands.length - 1) {
                programCounter++
                runScript()
            }
        }
    })
}
runScript()