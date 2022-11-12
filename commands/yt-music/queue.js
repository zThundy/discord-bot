import { MessageEmbed } from "discord.js";
import { FormatNumber } from "./../../classes/utils.js";

let queueMessages = {};
let queueIndex = {};

export function getCommandInfo() {
    return {
        command: "queue",
        description: "Show the list of queued songs in this server 🔠",
    }
}

const _getQueueDescription = (songs, minIndex, maxIndex) => {
    let description = "";
    for (var i in songs) {
        if ((Number(i) + 1) <= maxIndex && (Number(i) + 1) >= minIndex) {
            var title = (songs[i].title.length >= 40 ? songs[i].title.slice(0, 40)  + "..." : songs[i].title)
            if (songs[i].allowRatings && FormatNumber(songs[i].likes)) {
                description += `[${(Number(i) + 1)}] ${title} - ${FormatNumber(songs[i].likes)} 👍\n`;
            } else {
                description += `[${(Number(i) + 1)}] ${title} - No 👍 😢\n`;
            }
        }
    }
    return description;
}

const _initQueueMessage = async (client, args, message) => {
    let songs = client.player.getSongs();
    if (songs && songs[0]) {
        queueIndex[message.guild.id] = 1;
        let description = _getQueueDescription(songs, queueIndex[message.guild.id], (client.config.musicPlayer.queueMaxView - 1) + queueIndex[message.guild.id]);
        let embed = new MessageEmbed()
            .setTitle("Queue for " + message.guild.name)
            .setDescription("```" + description + "```");
        message.channel.send({ embeds: [embed] }).then(msg => {
            if (songs.length < client.config.musicPlayer.queueMaxView) {
                queueMessages[message.guild.id] = msg;
                return;
            };

            msg.react("⏪").then(() => {
                msg.react("◀️").then(() => {
                    msg.react("▶️").then(() => {
                        msg.react("⏩").then(() => {
                            queueMessages[message.guild.id] = msg;
                        });
                    });
                });
            });
        });
    } else {
        let embed = new MessageEmbed()
            .setDescription("No songs in queue 😢")
            .setColor("#FF0000");
        message.channel.send({ embeds: [embed] });
    }
}

function _shiftQueue(client, reactionMessage, user) {
    let message = reactionMessage.message;
    let songs = client.player.getSongs();
    if (songs.length === 0) { delete queueMessages[message.guild.id]; return; }
    if (queueMessages[message.guild.id] && queueMessages[message.guild.id].id === message.id) {
        switch(reactionMessage.emoji.name) {
            case "⏪":
                queueIndex[message.guild.id] = 1;
                break;
            case "◀️":
                if (queueIndex[message.guild.id] === 1) return;
                queueIndex[message.guild.id]--;
                break;
            case "▶️":
                if (queueIndex[message.guild.id] === songs.length) return;
                if ((queueIndex[message.guild.id] + client.config.musicPlayer.queueMaxView) > songs.length) return;
                queueIndex[message.guild.id]++;
                break;
            case "⏩":
                if ((queueIndex[message.guild.id] + client.config.musicPlayer.queueMaxView) > songs.length) return;
                queueIndex[message.guild.id] = songs.length - (client.config.musicPlayer.queueMaxView - 1);
                if (queueIndex[message.guild.id] < 0) queueIndex[message.guild.id] = 1;
                break;
        }

        let description = _getQueueDescription(songs, queueIndex[message.guild.id], (client.config.musicPlayer.queueMaxView - 1) + queueIndex[message.guild.id]);
        let embed = new MessageEmbed()
            .setTitle("Queue for " + message.guild.name)
            .setDescription("```" + description + "```");
        queueMessages[message.guild.id].edit({ embed });
    }
}

export async function reactionAdd(client, reactionMessage, user) { _shiftQueue(client, reactionMessage, user); }
export async function reactionRemove(client, reactionMessage, user) { _shiftQueue(client, reactionMessage, user); }
export async function run(client, args, message) { _initQueueMessage(client, args, message); }