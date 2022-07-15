class Colors {
    constructor() {
        this.reset = "\x1b[0m"
        this.colors = {
            black: "\x1b[30m",
            red: "\x1b[31m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            blue: "\x1b[34m",
            magenta: "\x1b[35m",
            cyan: "\x1b[36m",
            white: "\x1b[37m",
        }
        this.backgrounds = {
            black: "\x1b[40m",
            red: "\x1b[41m",
            green: "\x1b[42m",
            yellow: "\x1b[43m",
            blue: "\x1b[44m",
            magenta: "\x1b[45m",
            cyan: "\x1b[46m",
            white: "\x1b[47m"
        }
    }

    changeColor(clr, message) {
        if (this.colors[clr]) { return this.colors[clr] + message + this.reset }
        return message;
    }

    changeBackground(clr, message) {
        if (this.backgrounds[clr]) { return this.backgrounds[clr] + message + this.reset }
        return message;
    }
}

export default Colors;