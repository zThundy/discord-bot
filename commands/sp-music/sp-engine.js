import config from "../../config.js";
import Spotify from "../../spotify.js";
import { MessageEmbed } from "discord.js";
import { QueueSong } from "./../yt-music/yt-engine.js";
import { IsSpotifyPlaylist } from "../../utils.js";

const spotify = new Spotify(config.spotify);
var buisy = false;

function _ElaborateQueue(client, songs, message, voiceChannel) {
    if (songs && songs.length > 0) {
        const song = songs.shift();
        QueueSong(client, song, message, voiceChannel, false);
        setTimeout(() => { _ElaborateQueue(client, songs, message, voiceChannel); }, 10000)
    } else {
        buisy = false
    };
}

export async function SearchSongName(client, args, message, voiceChannel) {
    try {
        let songInfo = "";
        let tmp_args = [...args];
        if (tmp_args[1].indexOf("http") === -1) {
            let string;
            tmp_args.shift();
            for (var i in tmp_args) { string += tmp_args[i] + " "; }
            songInfo = await spotify.searchTrack(string);
            songInfo = songInfo[0];
        } else {
            if (!(args[1].includes("spotify") || args[1].includes("open.spotify"))) return console.error("Spotify link invalid");
            songInfo = await spotify.getTrackByURL(args[1]);
        }
        if (songInfo.artists)
            args = [args[0], songInfo.name, songInfo.artists[0].name];
        else
            args = [args[0], songInfo.name];
        QueueSong(client, args, message, voiceChannel, true);
    } catch (e) {
        console.error(e)
        let embed = new MessageEmbed()
            .setDescription("No song found on spotify ☹️")
            .setColor("#FF0000");
        message.channel.send({ embed });
    }
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
                // const elements = url.split("/");
                // const id = elements[4].split("?")[0];
                // console.log(id);
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
            message.channel.send({ embed });
        }
    } catch (e) {
        console.error(e)
        let embed = new MessageEmbed()
            .setDescription("No playlist found on spotify ☹️")
            .setColor("#FF0000");
        message.channel.send({ embed });
    }
}