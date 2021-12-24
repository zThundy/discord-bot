import { MessageEmbed } from "discord.js";

export function getCommandInfo() {
    return {
        command: "lyrics",
        description: "Will search the current song's lyrics from various sources 🧾"
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

    // check if the song has been fetched from spotify, if yes
    // use the spotify informations insted of youtube ones
    if (song.spotifyInfo) {
        song.title = song.spotifyInfo.name;
        if (song.spotifyInfo.artist) song.author.name = song.spotifyInfo.artist;
    }

    const lyrics = await client.lyrics.getTrackLyrics(song.title, song.author.name);
    lyrics.lyrics_body = lyrics.lyrics_body.split("...");
    lyrics.lyrics_body = lyrics.lyrics_body[0];
    // just randomly check if the string is longer than 100 because
    // if not, it's an error UwU
    if (lyrics.lyrics_body.length > 100) {
        var link = await client.lyrics.getTrackLyricUrl(song.title, song.author.name)
        link = link.split("?")[0];
        lyrics.lyrics_body += "\n\n**You can only view 30% of the lyric**";
        lyrics.lyrics_body += `\n**[MusixMatch Link](${link})**`;
    }
    let embed = new MessageEmbed()
        .setDescription(lyrics.lyrics_body)
        .setColor("#6600CC")
    message.channel.send({ embed });
}