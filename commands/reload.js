import { MessageEmbed } from "discord.js";
import config from "./../config.js";
import { RegisterCommand, GetCommand, UnregisterCommand } from "./init.js";

export async function run(client, args, message) {
    if (config.admins.includes(message.author.id)) {
        if (!args[1]) {
            let embed = new MessageEmbed()
                .setDescription("Give me a module to reload 🚫")
                .setColor("#FF0000");
            message.channel.send({ embed });
            return;
        }

        try {
            let command = GetCommand(args[1]);
            if (command[0]) {
                UnregisterCommand(client, command[0].path, args[1]);
                RegisterCommand(client, command[0].path, command[0].module + ".js");
                let embed = new MessageEmbed()
                    .setDescription("Module reloaded ♻️")
                    .setColor("#00FF00");
                message.channel.send({ embed });
            } else {
                let embed = new MessageEmbed()
                    .setDescription("Module not found 🚫")
                    .setColor("#FF0000");
                message.channel.send({ embed });
            }
        } catch(e) {
            let embed = new MessageEmbed()
                .setDescription("Can't reload the module 😅")
                .setColor("#00FF00");
            message.channel.send({ embed });
        }
    } else {
        let embed = new MessageEmbed()
            .setDescription("Nope! 🚫")
            .setColor("#FF0000");
        message.channel.send({ embed });
    }
}