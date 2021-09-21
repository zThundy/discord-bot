import { MessageEmbed } from "discord.js";
import { FormatToMysql } from "./../utils.js";
import config from "./../config.js";

let currency = {};
let dailyRoll = {};
let rolling = {};
let slotChannels = {};
let fastReroll = {};

export async function run(client, args, message) {
    if (!currency[message.guild.id]) currency[message.guild.id] = {}

    if (currency[message.guild.id][message.author.id] === null || currency[message.guild.id][message.author.id] === undefined) {
        currency[message.guild.id][message.author.id] = config.currency.enableDefaultCurrency ? config.currency.defaultCurrency : 0

        global.con.query(`INSERT INTO slot(guild, user, currency) VALUES(${message.guild.id}, ${message.author.id}, ${currency[message.guild.id][message.author.id]})`, (err, result) => {
             if (err) console.error(err);
        })
    }

    if (!slotChannels[message.guild.id] && args[1] != "setup") {
        let embed = new MessageEmbed()
            .setColor("#FF0000")
            .setDescription(`Please setup a slot channel first: *${config.prefix}bet setup* 📣`);
        message.channel.send({ embed });
        return;
    }

    if (args[1]) {
        if (args[1] == "setup") {
            if (!message.member.hasPermission("ADMINISTRATOR")) {
                let embed = new MessageEmbed()
                    .setColor("#FF0000")
                    .setDescription("You do not have admin privileges 🚫");
                message.channel.send({ embed });
                return;
            }

            slotChannels[message.guild.id] = message.channel.id

            global.con.query(`UPDATE servers SET slotChannelId = ${message.channel.id} WHERE id = ${message.guild.id}`, (err, result) => {
                 if (err) console.error(err);
            })

            let embed = new MessageEmbed()
                .setColor("#00FF00")
                .setDescription("Setup completed ✅");
            message.channel.send({ embed });
            return;
        }

        if (args[1] == "give") {
            let userID = 0;
            let mentionedUser = message.mentions.users.first();
            if (!mentionedUser) {
                if (args[2] == "me") {
                    userID = message.author.id;
                } else {
                    let embed = new MessageEmbed()
                        .setColor("#FF0000")
                        .setDescription("Please tag a user or use `me` instead 📋");
                    message.channel.send({ embed });
                    return;
                }
            } else {
                userID = mentionedUser.id;
            }

            if (!message.member.hasPermission("ADMINISTRATOR")) {
                let embed = new MessageEmbed()
                    .setColor("#FF0000")
                    .setDescription("You do not have admin privileges 🚫")
                message.channel.send({ embed })
                return
            }

            if (!args[2] || !isNaN(args[2])) {
                let embed = new MessageEmbed()
                    .setColor("#FF0000")
                    .setDescription("Please check your aguments and retry ❓")
                message.channel.send({ embed })
                return
            }

            if (!args[3] || isNaN(args[3])) {
                let embed = new MessageEmbed()
                    .setColor("#FF0000")
                    .setDescription("Please type a valid number ❓")
                message.channel.send({ embed })
                return
            }

            if (!currency[message.guild.id][userID]) {
                currency[message.guild.id][userID] = config.currency.enableDefaultCurrency ? config.currency.defaultCurrency : 0
                currency[message.guild.id][userID] += Number(args[3])
                global.con.query(`INSERT INTO slot(guild, user, currency) VALUES(${message.guild.id}, ${userID}, ${currency[message.guild.id][userID]})`, (err, result) => {
                     if (err) console.error(err);
                })
            } else {
                currency[message.guild.id][userID] += Number(args[3])
            }

            let embed = new MessageEmbed()
                .setColor("#00FF00")
                .setDescription(`Given ${Number(args[3])} to <@${userID}> 🥳`)
            message.channel.send({ embed })
            return
        }

        if (slotChannels[message.guild.id] == message.channel.id) {
            if (!rolling[message.guild.id]) {
                if (args[1] == "daily") {
                    global.con.query(`SELECT lastDaily FROM slot WHERE guild = ${message.guild.id} AND user = ${message.author.id}`, (err, result) => {
                         if (err) console.error(err);

                        if ((!dailyRoll[message.guild.id] || !dailyRoll[message.guild.id][message.author.id]) || Math.floor(((new Date() - dailyRoll[message.guild.id][message.author.id]) / 1000) / (24 * 60 * 60)) > 0) {
                            if (!dailyRoll[message.guild.id]) dailyRoll[message.guild.id] = {}
                            if (!result[0]) {
                                dailyRoll[message.guild.id][message.author.id] = new Date()
                            } else {
                                dailyRoll[message.guild.id][message.author.id] = result[0].lastDaily
                            }

                            global.con.query(`UPDATE slot SET lastDaily = '${FormatToMysql(dailyRoll[message.guild.id][message.author.id])}' WHERE guild = ${message.guild.id} AND user = ${message.author.id}`, (err, result) => {
                                 if (err) console.error(err);
                            })

                            StartSlot(message, message.author.id, 10)
                        } else {
                            let embed = new MessageEmbed()
                                .setColor("#FF0000")
                                .setDescription("You have already used your daily roll 😢")
                            message.channel.send({ embed })
                        }
                    })
                } else if (Number(args[1]) > 0) {
                    if (currency[message.guild.id][message.author.id] >= Number(args[1])) {
                        currency[message.guild.id][message.author.id] = Number(currency[message.guild.id][message.author.id]) - Number(args[1])

                        StartSlot(message, message.author.id, Number(args[1]))
                    } else {
                        let embed = new MessageEmbed()
                            .setColor("#FF0000")
                            .setDescription("You don't have enough money 😞")
                        message.channel.send({ embed })
                    }
                } else {
                    let embed = new MessageEmbed()
                        .setColor("#FF0000")
                        .setDescription("Argument not valid 😢")
                    message.channel.send({ embed })
                }
            } else {
                let embed = new MessageEmbed()
                    .setColor("#FF0000")
                    .setDescription("A game is already in progress 😲")
                message.channel.send({ embed })
            }
        } else {
            message.delete()
        }
    } else {
        if (slotChannels[message.guild.id] == message.channel.id) {
            let embed = new MessageEmbed()
                .setColor("#FF0000")
                .setDescription("Please insert the currency you want to bet 💰")
            message.channel.send({ embed })
        } else {
            message.delete()
        }
    }
}

export async function init(client) {
    global.con.query(`SELECT * FROM slot`, (err, result) => {
         if (err) console.error(err);

        for (var i in result) {
            if (!currency[result[i].guild])
                currency[result[i].guild] = {}

            currency[result[i].guild][result[i].user] = result[i].currency

            if (!dailyRoll[result[i].guild])
                dailyRoll[result[i].guild] = {}

            dailyRoll[result[i].guild][result[i].user] = result[i].lastDaily
        }
    })

    global.con.query(`SELECT * FROM servers`, (err, result) => {
         if (err) console.error(err);

        for (var i in result) {
            if (result[i].slotChannelId) {
                slotChannels[result[i].id] = result[i].slotChannelId
                
                client.channels.fetch(result[i].slotChannelId, true)
            }
        }
    })
}

function StartSlot(message, userID, amount) {
    rolling[message.guild.id] = true
    let percs = {}
    for (var i = 0; i < 3; i++) {
        let perc = GetRandomNumber(0, 100)
        percs[i] = perc
    }

    let winnings = {}
    for (var i in percs) {
        let emoji = CalculateEmoji(percs[i])
        winnings[i] = emoji
    }

    let data = CalculateWinning(amount, winnings)
    let fluctuation = ""
    if (data.amount > amount) {
        fluctuation = "↗️"
    } else if (data.amount == amount) {
        fluctuation = "🔀"
    } else {
        fluctuation = "↘️"
    }
    let string = "```"
    for (var i in winnings) {
        string += "|" + winnings[i].emoji
    }
    string += "|```\n"

    let embed = {
        color: "#00FF00",
        description: string,
        fields: [
            {
                name: "🔧 Status",
                value: "☑️ Done",
                inline: true
            },
            {
                name: "💸 Bet",
                value: amount,
                inline: true
            },
            {
                name: "💵 Your money",
                value: currency[message.guild.id][userID] + data.amount,
                inline: true
            },
            {
                name: "🤑 Winning",
                value: data.string,
                inline: true
            },
            {
                name: "💍 Fluctuation",
                value: fluctuation,
                inline: true
            }
        ]
    }

    // string += "\n\n**💸 Bet: " + amount + "**"
    // string += "\n\n**💵 Your money: " + (currency[message.guild.id][message.author.id] + data.amount) + "**"
    // string += "\n\n**🤑 Winning: " + data.string + "**"
    // string += "\n\n**💍 Fluctuation: " + fluctuation + "**"

    StartAnimation(message, userID, amount, embed, data.amount)
}

function CalculateWinning(amount, winnings) {
    let winAmount = 0
    let winPerc = 0
    if (winnings[0].emoji == winnings[1].emoji) {
        winAmount = winnings[0].winPerc * amount
        winPerc = winnings[0].winPerc
    }
    if (winnings[1].emoji == winnings[2].emoji) {
        winAmount = winnings[1].winPerc * amount
        winPerc = winnings[1].winPerc
    }
    if (winnings[2].emoji == winnings[0].emoji) {
        winAmount = winnings[2].winPerc * amount
        winPerc = winnings[2].winPerc
    }
    if (winnings[0].emoji == winnings[1].emoji && winnings[1].emoji == winnings[2].emoji) {
        winAmount = ((winnings[2].winPerc + config.currency.trisBonus) * amount)
        winPerc = winnings[2].winPerc + config.currency.trisBonus
    }
    return {amount: winAmount, string: winAmount + " (" + winPerc + "x)"}
}

function GetRandomNumber(min, max) {
    return Math.round(Math.floor(Math.random() * (max - min) + min) / 10) * 10;
}

function GetRandomStringEmoji(message, userID, amount) {
    let percs = {}
    for (var i = 0; i < 3; i++) {
        let perc = GetRandomNumber(0, 100)
        percs[i] = perc
    }

    let winnings = {}
    for (var i in percs) {
        let emoji = CalculateEmoji(percs[i])
        winnings[i] = emoji
    }
    
    let string = "```"
    for (var i in winnings) {
        string += "|" + winnings[i].emoji
    }
    string += "|```\n"

    let embed = {
        color: "#FFFF00",
        description: string,
        fields: [
            {
                name: "🔧 Status",
                value: "🔄 Rolling",
                inline: true
            },
            {
                name: "💸 Bet",
                value: amount,
                inline: true
            },
            {
                name: "💵 Your money",
                value: currency[message.guild.id][userID],
                inline: true
            },
            {
                name: "🤑 Winning",
                value: "❓",
                inline: true
            },
            {
                name: "💍 Fluctuation",
                value: "❓",
                inline: true
            }
        ]
    }
    // string += "\n\n**💸 Bet: " + amount + "**"
    // string += "\n\n**💵 Your money: " + currency[message.guild.id][message.author.id] + "**"
    // string += "\n\n**🤑 Winning: ❓**"
    // string += "\n\n**💍 Fluctuation: ❓**"

    return embed
}

function CalculateEmoji(perc) {
    let emojis = config.currency.emojis
    let info = {}
    for (var i in emojis) {
        if (emojis[i].showPerc <= perc) {
            info.perc = emojis[i].showPerc
            info.emoji = i
            info.winPerc = emojis[i].winningPerc
        }
    }
    return info
}

function StartAnimation(message, userID, amount, winString, winAmount) {
    let embed = new MessageEmbed()
        .setColor("#FFFF00")
        .setDescription("Game loading...")
    message.channel.send({ embed }).then(msg => {
        setTimeout(() => {
            let embed = GetRandomStringEmoji(message, userID, amount)
            // let embed = new MessageEmbed()
            //     .setColor("#FFFF00")
            //     .setDescription(string)
            msg.edit({ embed }).then(() => {
                setTimeout(() => {
                    let embed = GetRandomStringEmoji(message, userID, amount)
                    // let embed = new MessageEmbed()
                    //     .setColor("#FFFF00")
                    //     .setDescription(string)
                    msg.edit({ embed }).then(() => {
                        setTimeout(() => {
                            let embed = GetRandomStringEmoji(message, userID, amount)
                            // let embed = new MessageEmbed()
                            //     .setColor("#FFFF00")
                            //     .setDescription(string)
                            msg.edit({ embed }).then(() => {
                                setTimeout(() => {
                                    let embed = GetRandomStringEmoji(message, userID, amount)
                                    // let embed = new MessageEmbed()
                                    //     .setColor("#FFFF00")
                                    //     .setDescription(string)
                                    msg.edit({ embed }).then(() => {
                                        setTimeout(() => {
                                            let embed = GetRandomStringEmoji(message, userID, amount)
                                            // let embed = new MessageEmbed()
                                            //     .setColor("#FFFF00")
                                            //     .setDescription(string)
                                            msg.edit({ embed }).then(() => {
                                                setTimeout(() => {
                                                    currency[message.guild.id][userID] += Number(winAmount)
                                                    rolling[message.guild.id] = false
                                                    SaveMyCurrency(message, userID)
                                                    // let embed = new MessageEmbed()
                                                    //     .setColor("#00FF00")
                                                    //     .setDescription(winString)
                                                    msg.edit({ embed: winString }).then(() => {
                                                        msg.react("🔄").then(() => {
                                                            fastReroll[message.guild.id] = {message: msg.id, amount: amount}
                                                        })
                                                    })
                                                }, 1000)
                                            })
                                        }, 1000)
                                    })
                                }, 1000)
                            })
                        }, 1000)
                    })
                }, 1000)
            })
        }, 1000)
    })
}

function SaveMyCurrency(message, userID) {
    global.con.query(`UPDATE slot SET currency = ${currency[message.guild.id][userID]} WHERE guild = ${message.guild.id} AND user = ${userID}`, (err, result) => {
         if (err) console.error(err);
    })
}

export async function reactionAdd(client, reactionMessage, user) {
    let guildId = reactionMessage.message.guild.id

    if (fastReroll[guildId]) {
        let amount = Number(fastReroll[guildId].amount)
        
        if (fastReroll[guildId].message == reactionMessage.message.id) {
            if ((Number(currency[guildId][user.id]) - amount) > 0) {
                currency[guildId][user.id] = Number(currency[guildId][user.id]) - amount
                StartSlot(reactionMessage.message, user.id, amount)
            }
            
            delete fastReroll[guildId]
        }
    }
}