import { MessageEmbed } from "discord.js";

export function getCommandInfo() {
    return {
        command: "loop",
        description: "Will start looping the current playling song 🔂"
    }
}

export async function run(client, args, message) {
    try {
        const [loop, nowplaying] = client.player.loop();
        let string = `Now looping **${nowplaying.title}**`;
        if (loop) string = `Stopped looping of **${nowplaying.title}**`;
        let embed = new MessageEmbed()
            .setDescription(string)
            .setColor("#FFFF00");
        message.channel.send({ embed });
    } catch(e) {
        console.error(e);
        let embed = new MessageEmbed()
            .setDescription("No song playing rn 😔")
            .setColor("#FF0000");
        message.channel.send({ embed });
    }
}