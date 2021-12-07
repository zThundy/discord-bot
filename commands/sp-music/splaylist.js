import { MessageEmbed } from "discord.js";
import { GetPlaylistSongs } from "./sp-engine.js";

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
        message.channel.send({ embed });
        return;
    }
    GetPlaylistSongs(client, args, message, voiceChannel);
}