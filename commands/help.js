export async function run(client, args, message) {
    const fields = []
    var embed = {}
    const commandsArgs = {}

    client.commands.forEach(command => {
        if (command.getCommandInfo) {
            const info = command.getCommandInfo();
            fields.push({
                name: client.config.prefix + info.command,
                value: info.description + "\n`❓ Has arguments: " + (info.args ? "✅" : "❌") + "`"
            });
            commandsArgs[info.command] = info.args;
        }
    })
    
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
            value: "`" + client.config.prefix + args[1] + " " + commandsArgs[args[1]][0].name + "`"
        })

        embed = {
            color: "#000000",
            title: 'Arguments list',
            description: 'Possible arguments for command ' + client.config.prefix + args[1],
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