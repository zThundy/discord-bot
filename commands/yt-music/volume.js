import { MessageEmbed } from "discord.js";

export async function run(client, args, message) {
    var volume = client.player.getVolume();
    args[1] = Number(args[1]);
    volume = Math.round((volume + Number.EPSILON) * 100) / 100

    var string;
    if (args[1] === null || args[1] === undefined) {
        string = `Current volume value is: **${Math.floor(volume * 100)}**`;
        args[1] = volume;
    } else {
        string = `Changing volume value from **${Math.floor(volume * 100)}** to **${args[1]}**`;
    }

    args[1] = args[1] / 100;
    args[1] = Math.round((args[1] + Number.EPSILON) * 100) / 100
    if (!(args[1] <= 1.0 && args[1] >= 0.01)) {
        if (args[1].isNaN()) {
            string = `**${args[1]}** is not a valid value`;
        } else {
            string = `You can't change the volume value to **${Math.floor(args[1] * 100)}**`;
        }
    } else {
        client.player.setVolume(args[1]);
    }

    let embed = new MessageEmbed()
        .setDescription(string)
        .setColor("#FFFF00");
    message.channel.send({ embed });
}