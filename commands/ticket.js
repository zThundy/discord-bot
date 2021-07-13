import { MessageEmbed } from "discord.js";
import config from "./../config.js"

let messageIds = {};
let ticketChansId = {};
let ticketIds = {};
let openedTickets = {};
let ticketsCategory = {};

/*
export async function reactionAdd(client, reactionMessage, user) {
    let guildId = reactionMessage.message.guild.id
    let ticketId = reactionMessage.message.channel.name.split("-")[1]
    let pass = false;

    if (reactionMessage.message.channel.id == ticketChansId[guildId]) pass = true;
    if (reactionMessage.message.id == messageIds[guildId]) pass = true;
    if (ticketId && reactionMessage.message.channel.id == openedTickets[guildId][ticketId]) pass = true;
    if (!pass) return;

    // controllo delle emoji
    if (reactionMessage.emoji.name == "✅") {
        deleteTicket(reactionMessage.message);
        return;
    }

    if (messageIds[guildId] == reactionMessage.message.id) {
        if (reactionMessage.emoji.name == "🎫") {
            reactionMessage.message.reactions.resolve("🎫").users.remove(user.id)
        }

        let embed = new MessageEmbed()
            .setColor("#009900")
            .setDescription("Ticket opened! <@" + user.id + ">")
        reactionMessage.message.channel.send({ embed }).then(message => {
            setTimeout(() => {
                message.delete()
            }, 3000)
        })

        if (!ticketsCategory[guildId]) {
            let channel = await reactionMessage.message.guild.channels.create("tickets", {
                type: "category"
            })

            ticketsCategory[guildId] = channel.id

            global.con.query(`UPDATE servers SET ticketCategoryId = ${channel.id} WHERE id = ${guildId}`, (err, result) => {
                if (err) throw err;
            })
        }

        ticketIds[guildId]++
        reactionMessage.message.guild.channels.create(`ticket-${ticketIds[guildId]}`, {
            type: "text",
            parent: ticketsCategory[guildId],
            topic: "Ticket channel system",
            permissionOverwrites: [
                {
                    id: user.id,
                    allow: [
                        "VIEW_CHANNEL",
                        "SEND_MESSAGES",
                        "EMBED_LINKS",
                        "ATTACH_FILES",
                        "READ_MESSAGE_HISTORY",
                        "MENTION_EVERYONE",
                        "USE_EXTERNAL_EMOJIS"
                    ],
                }
            ],
        }).then(channel => {
            let embed = new MessageEmbed()
                .setColor("#009900")
                .setTitle("Thank you for opening a ticket!")
                .setDescription("Please describe your problem and wait an answer from our staff\n\n✅ To close and flag as solved")
            channel.send("New Ticket! <@" + user.id + "> " + "<@&" + config.ticketRole + ">", { embed }).then(message => {
                message.react("✅")

                global.con.query(`INSERT INTO tickets(guild, channelId, headerMessId, ticketId) VALUES(${guildId}, ${channel.id}, ${message.id}, ${ticketIds[guildId]})`, (err, result) => {
                    if (err) throw err;
                    if (!openedTickets[guildId]) openedTickets[guildId] = {};
                    openedTickets[guildId][ticketIds[guildId]] = channel.id
                });
            });
        });

        global.con.query(`UPDATE servers SET lastTicketId = '${ticketIds[guildId]}' WHERE id = '${guildId}'`, (err, result) => {
            if (err) throw err;
        });
    }
}
*/

const deleteTicket = async (message) => {
    let ticketId = message.channel.name.split("-")[1]

    if (openedTickets[message.guild.id][ticketId] == message.channel.id) {

        global.con.query(`DELETE FROM tickets WHERE guild = ${message.guild.id} AND channelId = ${message.channel.id}`, (err, result) => {
            if (err) throw err;
        });

        delete openedTickets[message.guild.id][ticketId]
        message.channel.delete()
    }
}

export async function run(client, args, message) {
    if (args[1] == "create") {
        if (!message.member.hasPermission("ADMINISTRATOR")) {
            let embed = new MessageEmbed()
                .setColor("#FF0000")
                .setDescription("You do not have admin privileges 🚫")
            message.channel.send({ embed })
            return
        }

        message.delete()
        
        let embed = new MessageEmbed()
            .setColor("#6600CC")
            .setTitle("Tickets")
            .setDescription("React to create a new ticket")
        message.channel.send({ embed }).then(msg => {
            msg.react('🎫').then(() => {
                global.con.query(`UPDATE servers SET ticketMessId = '${msg.id}', ticketChanId = '${msg.channel.id}' WHERE id = '${message.guild.id}'`, (err, result) => {
                    if (err) throw err;
                    messageIds[message.guild.id] = msg.id
                    ticketIds[message.guild.id] = 0
                })
            })
        });
    } else if (args[1] == "close") {
        deleteTicket(message)
    }
}

export async function init(client) {
    global.con.query(`SELECT * FROM servers`, (err, result) => {
        if (err) throw err;

        try {
            for (var i in result) {
                ticketIds[result[i].id] = result[i].lastTicketId
                // controllo che il ticketing system sia configurato
                if (result[i].ticketChanId && result[i].ticketMessId) {
                    messageIds[result[i].id] = result[i].ticketMessId
                    ticketChansId[result[i].id] = result[i].ticketChanId
                    ticketsCategory[result[i].id] = result[i].ticketCategoryId
    
                    client.channels.fetch(result[i].ticketChanId, true).then(channel => {
                        channel.messages.fetch(result[i].ticketMessId, true)
                    })
                }
            }
        } catch (e) { console.log(e) }
    })
    
    global.con.query(`SELECT * FROM tickets`, (err, result) => {
        if (err) throw err;

        for (var i in result) {
            if (!openedTickets[result[i].guild]) openedTickets[result[i].guild] = {};
            openedTickets[result[i].guild][result[i].ticketId] = result[i].channelId

            client.channels.fetch(result[i].channelId, true).then(channel => {
                channel.messages.fetch()
                // channel.messages.fetch(result[i].headerMessId, true)
            })
        }
    })
}