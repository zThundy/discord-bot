import { MessageEmbed } from "discord.js";

export function getCommandInfo() {
    return {
        command: "loop",
        description: "Will start looping the current playling song 🔂"
    }
}

export async function run(client, args, message) {
    const [loop, nowplaying] = client.player.loop();
    let string = `Now looping **${nowplaying.title}**`;
    if (loop) string = `Stopped looping of **${nowplaying.title}**`;
    let embed = new MessageEmbed()
        .setDescription(string)
        .setColor("#FFFF00");
    message.channel.send({ embed });
}