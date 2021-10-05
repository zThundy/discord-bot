import config from "./../config.js";

let fields = []
let commandsArgs = {}

export async function run(client, args, message) {
    let embed = {}
    
    if (args[1] && commandsArgs[args[1]]) {
        let argsFields = []
        for (var i in commandsArgs[args[1]]) {
            argsFields.push({
                name: commandsArgs[args[1]][i].name,
                value: commandsArgs[args[1]][i].description + "\n`🔑 Admins restricted: " + (commandsArgs[args[1]][i].onlyAdmins ? "✅" : "❌") + "`"
            })
        }

        argsFields.push({
            name: "🔎 Expample",
            value: "`" + config.prefix + args[1] + " " + commandsArgs[args[1]][0].name + "`"
        })

        embed = {
            color: "#000000",
            title: 'Arguments list',
            description: 'Possible arguments for command ' + config.prefix + args[1],
            fields: argsFields,
            footer: {
                text: 'Made with ❤️ by zThundy__',
            },
        }
    } else {
        embed = {
            color: "#000000",
            title: 'Commands list',
            description: 'This is a list of all existing commands',
            fields: fields,
            footer: {
                text: 'Made with ❤️ by zThundy__',
            },
        }
    }

    message.channel.send({ embed })
}

export async function init(client) {
    let commands = config.commands
    for (var i in commands) {
        fields.push({
            name: config.prefix + commands[i].command,
            value: commands[i].description + "\n`❓ Has arguments: " + (commands[i].args ? "✅" : "❌") + "`"
        })
        commandsArgs[commands[i].command] = commands[i].args
    }
}