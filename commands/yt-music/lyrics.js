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
        return message.channel.send({ embed });
    }

    // check if the song has been fetched from spotify, if yes
    // use the spotify informations insted of youtube ones
    if (song.spotifyInfo) {
        song.title = song.spotifyInfo.name;
        if (song.spotifyInfo.album.name) song.albumName = song.spotifyInfo.album.name;
        if (song.spotifyInfo.artists && song.spotifyInfo.artists[0]) song.author.name = song.spotifyInfo.artists[0].name;
    }

    try {
        message.react("✅")
            .then(async () => {
                const lyrics = await client.lyrics.getTrackLyrics(song.title, song.author.name, song.albumName);
                let embed = new MessageEmbed()
                    .setDescription(lyrics)
                    .setColor("#6600CC");
                message.channel.send({ embed });
            });
    } catch(e) {
        let embed = new MessageEmbed()
            .setDescription("Nothing found. Sorry 😔")
            .setColor("#6600CC");
        message.channel.send({ embed });
    }
}