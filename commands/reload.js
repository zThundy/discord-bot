import { MessageEmbed } from "discord.js";
import config from "./../config.js";
import { RegisterCommand, GetCommand, RemoveFromPath } from "./init.js";

export async function run(client, args, message) {
    if (config.admins.includes(message.author.id)) {
        if (!args[1]) {
            let embed = new MessageEmbed()
                .setDescription("Give me a module to reload 🚫")
                .setColor("#FF0000")

            message.channel.send({ embed })
            return
        }

        let embed = new MessageEmbed()
            .setDescription("Module reloaded ♻️")
            .setColor("#00FF00")
    
        message.channel.send({ embed })
        let command = GetCommand(args[1])
        // console.log(command)
        // console.log(command[0].path, command[0].module)
        if (command[0]) {
            // console.log(client.commands.get(command[0].module))
            client.commands.delete(command[0].module)
            // console.log(client.commands.get(command[0].module))
            RegisterCommand(client, command[0].path, command[0].module + ".js")
            RemoveFromPath(command[0].path)
        } else {
            let embed = new MessageEmbed()
                .setDescription("Module not found 🚫")
                .setColor("#FF0000")

            message.channel.send({ embed })
        }
    } else {
        let embed = new MessageEmbed()
            .setDescription("Nope! 🚫")
            .setColor("#FF0000")
    
        message.channel.send({ embed })
    }
}

// export async function init(client) {
//     
// }