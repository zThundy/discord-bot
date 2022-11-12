import { MessageEmbed } from "discord.js";

export function getCommandInfo() {
    return {
        command: "volume",
        description: "Change the bot volume; values are from 1 to 100 🔊",
    }
}

function _round(n) {
    n = Number(n);
    return Math.round((n + Number.EPSILON) * 100) / 100
}

export async function run(client, args, message) {
    let newVolume = args[1];
    var oldVolume = client.player.getVolume();

    // here we check if a user is giving a new volume level; if yes
    // then we print the changing volume message
    var string;
    if (!newVolume) {
        newVolume = _round(oldVolume);
        string = `Current volume value is: **${newVolume * 100}**`;
    } else {
        string = `Changing volume value from **${Math.floor(oldVolume * 100)}** to **${newVolume}**`;
    }

    // convert the newVolume string to a number for future transformations
    newVolume = Number(newVolume);
    // with this conditional we check if the given value is a number.
    newVolume = isNaN(newVolume) ? false : _round(newVolume);
    // with this check, we filter all the values a user can't type in
    if (!newVolume && !(newVolume <= 1.0 && newVolume >= 0.01)) {
        string = `You can't change the volume value to **${args[1]}**`;
    } else {
        if (oldVolume !== newVolume) newVolume = _round(newVolume) / 100;
        client.player.setVolume(newVolume);
    }

    let embed = new MessageEmbed()
        .setDescription(string)
        .setColor("#FFFF00");
    message.channel.send({ embeds: [embed] });
}