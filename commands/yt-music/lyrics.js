import { MessageEmbed } from "discord.js";

export function getCommandInfo() {
    return {
        command: "lyrics",
        description: "Will search the current song's lyrics from various sources 📜"
    }
}

export async function run(client, args, message) {
    const a = client.player.nowplaying();
    const song = a[0];

    if (!song) {
        let embed = new MessageEmbed()
            .setDescription("No song playing rn 😔")
            .setColor("#FF0000");
        message.channel.send({ embed });
        return;
    }

    const lyrics = await client.lyrics.getTrackLyrics(song.title, song.author.name);
    lyrics.lyrics_body = lyrics.lyrics_body.replace("** This Lyrics is NOT for Commercial use **", "** You can only view 30% of the lyric **")
    let embed = new MessageEmbed()
        .setDescription(lyrics.lyrics_body)
        .setColor("#6600CC")
    message.channel.send({ embed });
}