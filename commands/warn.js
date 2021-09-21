import { MessageEmbed } from "discord.js";
import config from "./../config.js";

let warnedUsers = {};
let indexNum = 1;
let lastMessageId = 0;

export async function run(client, args, message) {
    var guildMember = message.mentions.members.first();
    if (args[1] == "info") {
        if (!guildMember) {
            let embed = new MessageEmbed().setColor("#FF0000").setDescription("Please tag a user to see it's warns infoes")
            message.channel.send({ embed })
            return;
        }
        SendWarnInfo(message, guildMember);
        return;
    }

    let lastWarnId = GetNewWarnId(guildMember)
    let reason = args.join(" ").slice(29);
    if (!reason) {
        reason = "No given reason"
    }

    if (guildMember) {
        let embed = new MessageEmbed()
            .setTitle("You have been warned!")
            .setColor("#FF0000")
            .setDescription("<@" + guildMember.id + "> has been warned with reason: **" + reason + "**")
            .setTimestamp(new Date())

        message.channel.send({ embed })

        if (!warnedUsers[guildMember.id]) warnedUsers[guildMember.id] = {};
        warnedUsers[guildMember.id][lastWarnId] = reason

        global.con.query(`INSERT INTO warns(user, warnid, reason) VALUES(${guildMember.id}, ${lastWarnId}, '${reason}')`, (err, result) => {
             if (err) console.error(err);

            if (lastWarnId >= config.warn.role1.assignOn) {
                // console.log("ruolo 1")
                message.guild.roles.fetch(config.warn.role1.id, true).then(role => {
                    guildMember.roles.add(role)
                })
            }

            if (lastWarnId >= config.warn.role2.assignOn) {
                // console.log("ruolo 2")
                message.guild.roles.fetch(config.warn.role2.id, true).then(role => {
                    guildMember.roles.add(role)
                })
            }

            if (lastWarnId >= config.warn.role3.assignOn) {
                // console.log("ruolo 3")
                message.guild.roles.fetch(config.warn.role3.id, true).then(role => {
                    guildMember.roles.add(role)
                })
            }
        })
    }
}

export async function init(client) {
    global.con.query(`SELECT * FROM warns`, (err, result) => {
         if (err) console.error(err);
        for (var i in result) {
            if (!warnedUsers[result[i].user]) warnedUsers[result[i].user] = {};
            warnedUsers[result[i].user][result[i].warnid] = result[i].reason
        }
    })
}

export async function reactionAdd(client, reactionMessage, user) {
    if (reactionMessage.message.id != lastMessageId) return;

    if (reactionMessage.message.reactions.resolve("▶️") && reactionMessage.message.reactions.resolve("◀️")) {
        reactionMessage.message.reactions.resolve("▶️").users.remove(user.id)
        reactionMessage.message.reactions.resolve("◀️").users.remove(user.id)

        if (reactionMessage.emoji.name == "▶️") {
            indexNum++
        } else if (reactionMessage.emoji.name == "◀️") {
            if (indexNum == 1) return;
            indexNum--
        }
    }

    let description = GetWarnDescription(reactionMessage.message, user, indexNum, (config.warn.maxView - 1) + indexNum);
    let embed = new MessageEmbed().setDescription("```" + description + "```").setTitle("Warn info for " + user.username)  
    reactionMessage.message.edit({ embed })
}

const SendWarnInfo = async (message, guildMember) => {
    let description = GetWarnDescription(message, guildMember.user, 1, config.warn.maxView);
    let embed = new MessageEmbed().setDescription("```" + description + "```").setTitle("Warn info for " + guildMember.user.username)
    
    message.channel.send({ embed }).then(message => {
        if (GetNewWarnId(guildMember) - 1 > config.warn.maxView) {
            message.react("◀️").then(() => {
                message.react("▶️")
            })
            lastMessageId = message.id
        }
    })
}

const GetWarnDescription = (message, user, minIndex, maxIndex) => {
    let description = "";
    for (var i in warnedUsers[user.id]) {
        if (i <= maxIndex && i >= minIndex) {
            let reason = warnedUsers[user.id][i]
            if (reason.length >= 30) reason = reason.slice(0, 33) + "...";
            description += `[${i}] ${user.username} - ${reason}\n`
        }
    }
    return description;
}

const GetNewWarnId = (guildMember) => {
    var index = 0;
    for (var i in warnedUsers[guildMember.user.id]) {
        index = i
    }
    return Number(index) + 1;
}