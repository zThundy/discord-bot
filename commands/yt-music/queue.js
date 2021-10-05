import { MessageEmbed } from "discord.js";
import { GetSongs } from "./yt-engine.js";
import { FormatNumber } from "./../../utils.js";
import config from "./../../config.js";

let queueMessages = {};
let queueIndex = {};

export async function run(client, args, message) {
    CreateQueueMessage(client, args, message);
}

const CreateQueueMessage = async (client, args, message) => {
    let songs = await GetSongs(message)

    if (songs && songs[0]) {
        queueIndex[message.guild.id] = 1;

        let description = GetQueueDescription(songs, queueIndex[message.guild.id], (config.musicPlayer.queueMaxView - 1) + queueIndex[message.guild.id]);
        let embed = new MessageEmbed()
            .setTitle("Queue for " + message.guild.name)
            .setDescription("```" + description + "```");

        message.channel.send({ embed }).then(msg => {
            if (songs.length < config.musicPlayer.queueMaxView) {
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
        message.channel.send({ embed });
    }
}

export async function reactionAdd(client, reactionMessage, user) {
    let message = reactionMessage.message;
    let songs = await GetSongs(message);

    if (songs.length == 0) {
        delete queueMessages[message.guild.id];
        return;
    }

    if (queueMessages[message.guild.id] && queueMessages[message.guild.id].id == message.id) {
        reactionMessage.message.reactions.resolve("⏪").users.remove(user.id);
        reactionMessage.message.reactions.resolve("◀️").users.remove(user.id);
        reactionMessage.message.reactions.resolve("▶️").users.remove(user.id);
        reactionMessage.message.reactions.resolve("⏩").users.remove(user.id);

        if (reactionMessage.emoji.name == "⏪") {
            queueIndex[message.guild.id] = 1;
        } else if (reactionMessage.emoji.name == "◀️") {
            if (queueIndex[message.guild.id] == 1) return;
            queueIndex[message.guild.id]--;
        } else if (reactionMessage.emoji.name == "▶️") {
            if (queueIndex[message.guild.id] == songs.length) return;
            if ((queueIndex[message.guild.id] + config.musicPlayer.queueMaxView) >= songs.length) return;
            queueIndex[message.guild.id]++;
        } else if (reactionMessage.emoji.name == "⏩") {
            if ((queueIndex[message.guild.id] + config.musicPlayer.queueMaxView) >= songs.length) return;
            queueIndex[message.guild.id] = songs.length;
        }

        let description = GetQueueDescription(songs, queueIndex[message.guild.id], (config.musicPlayer.queueMaxView - 1) + queueIndex[message.guild.id]);
        let embed = new MessageEmbed()
            .setTitle("Queue for " + message.guild.name)
            .setDescription("```" + description + "```");
        queueMessages[message.guild.id].edit({ embed });
    }
}

const GetQueueDescription = (songs, minIndex, maxIndex) => {
    let description = "";

    for (var i in songs) {
        if ((Number(i) + 1) <= maxIndex && (Number(i) + 1) >= minIndex) {
            if (songs[i].allowRatings) {
                description += `[${(Number(i) + 1)}] ${songs[i].title} - ${FormatNumber(songs[i].likes)} 👍 | ${FormatNumber(songs[i].dislikes)} 👎\n`;
            } else {
                description += `[${(Number(i) + 1)}] ${songs[i].title} - No 👍 or 👎 😢\n`;
            }
        }
    }

    return description;
}