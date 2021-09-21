import { MessageEmbed } from "discord.js";
import config from "./../config.js";

let cachedChannels = {};

export async function run(client, args, message) {
    if (args[1] == "bind") {
        let embed = new MessageEmbed()
            .setDescription("Channel is now binded for join/quit messages")
            .setColor("#00FF00")

        message.channel.send({ embed })

        if (cachedChannels[message.guild.id]) {
            global.con.query(`UPDATE announces SET channelId = '${message.channel.id}' WHERE guild = '${message.guild.id}'`, (err, result) => {
                if (err) console.error(err);
            });
        } else {
            global.con.query(`INSERT INTO announces(guild, channelId) VALUES(${message.guild.id}, ${message.channel.id})`, (err, result) => {
                if (err) console.error(err);
                cachedChannels[message.guild.id] = message.channel.id;
            });
        }
    }
}

export async function init(client) {
    global.con.query(`SELECT * FROM announces`, (err, result) => {
        if (err) console.error(err);
        for (var i in result) {
            cachedChannels[result[i].guild] = result[i].channelId;
            client.channels.fetch(result[i].channelId, true);
        }
    });
}

export async function memberJoin(client, member) {
    console.log(member)
}

// export async function reactionAdd(client, reactionMessage, user) { }