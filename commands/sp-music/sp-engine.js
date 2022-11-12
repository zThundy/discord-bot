import config from "../../config.js";
import Spotify from "../../classes/spotify.js";
import { MessageEmbed } from "discord.js";
import { IsSpotifyPlaylist } from "../../classes/utils.js";

const spotify = new Spotify(config.spotify);
var buisy = false;

function _ElaborateQueue(client, songs, message, voiceChannel) {
    if (songs && songs.length > 0) {
        const song = songs.shift();
        client.player.play(song)
            .then(message.react("✅"))
            .catch(e => {
                let embed = new MessageEmbed()
                    .setDescription(e)
                    .setColor("#FF0000");
                this.message.channel.send({ embeds: [embed] });
            });
        setTimeout(() => { _ElaborateQueue(client, songs, message, voiceChannel); }, 30 * 1000)
    } else {
        buisy = false
    };
}

// https://open.spotify.com/playlist/1yDWXzzxuccGQ2jjcSWIQE?si=fa54d7c8b99c4d00
export async function GetPlaylistSongs(client, args, message, voiceChannel) {
    try {
        let songs = [];
        let errorMessage;
        if (!args[1]) {
            errorMessage = "Please specify a link 😒";
        }
        if (buisy) {
            errorMessage = "Please wait until the selected playlist is beeing elaborated 😒";
        }
        if (!errorMessage) {
            if (IsSpotifyPlaylist(args[1])) {
                buisy = true;
                const url = args[1];
                const playlist = await spotify.getPlaylistByURL(url);
                for (var i in playlist.tracks.items) {
                    const songInfo = playlist.tracks.items[i].track;
                    if (songInfo.artists)
                        args = [args[0], songInfo.name, songInfo.artists[0].name];
                    else
                        args = [args[0], songInfo.name];
                    songs.push(args);
                }
                _ElaborateQueue(client, songs, message, voiceChannel);
            }
        } else {
            let embed = new MessageEmbed()
                .setDescription(errorMessage)
                .setColor("#FF0000");
            message.channel.send({ embeds: [embed] });
        }
    } catch (e) {
        console.error(e)
        let embed = new MessageEmbed()
            .setDescription("No playlist found on spotify ☹️")
            .setColor("#FF0000");
        message.channel.send({ embeds: [embed] });
    }
}