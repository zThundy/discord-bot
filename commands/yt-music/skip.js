import { MessageEmbed } from "discord.js";
import { SkipCurrentSong } from "./engine.js";
import config from "./../../config.js";

let timeouts = {};

export async function run(client, args, message) {
    if (timeouts[message.guild.id]) {
        let embed = new MessageEmbed()
            .setDescription("Give me some time to think 😧")
            .setColor("#FFFF00");
        message.channel.send({ embed });
        return;
    }

    if (!timeouts[message.guild.id]) timeouts[message.guild.id] = true;
    setTimeout(() => {
        delete timeouts[message.guild.id];
    }, config.musicPlayer.timeBetweenCommands * 1000);

    SkipCurrentSong(message);
}