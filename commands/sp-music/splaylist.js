import { MessageEmbed } from "discord.js";
import { GetPlaylistSongs } from "./sp-engine.js";

export function getCommandInfo() {
    return {
        command: "splaylist",
        description: "Start fetching all songs from a spotify playlist link 🔊",
        args: [
            {
                name: "spotify-playlist-link",
                description: "Adding this argument the bot will join (if not already) to your channel and will start fetching all songs from a spotify playlist link"
            }
        ]
    }
}

export async function run(client, args, message) {
    let errMessage;
    let voiceChannel = message.member.voice.channel;
    if (!args[1])
        errMessage = "Choose a link first 😋";
    if (!voiceChannel)
        errMessage = "You need to be in a voice channel 😅";
    if (!errMessage) {
        let permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) 
            errMessage = "I cannot join the voice channel you're in ☹️";
    }
    if (errMessage) {
        let embed = new MessageEmbed()
            .setDescription(errMessage)
            .setColor("#FF0000");
        message.channel.send({ embeds: [embed] });
        return;
    }
    GetPlaylistSongs(client, args, message, voiceChannel);
}