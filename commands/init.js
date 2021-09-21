import fs from "fs";
import { MessageEmbed } from "discord.js"

let paths = [];
let timeouts = {};

export function GetCommands() { return paths; }

export function RemoveFromPath(path) {
    paths = paths.filter(filterPath => filterPath.path != path)
}

export function GetCommand(command) { return paths.filter(path => path.module == command) }

export async function RegisterCommand(client, path, file) {
    if (!file.endsWith(".js") || file.startsWith("init")) return;
    let props = await import(path);
    paths.push({ path: path, module: file.split(".")[0] });
    console.info("\x1b[33m[Info] Comando caricato: " + file + "\x1b[0m")
    client.commands.set(file.split(".")[0], props);
    if (props.init) props.init(client);
}

export async function init(client, config) {
    fs.readdir("./commands/", async (err, files) => {
        if (err) throw(err);
        files.forEach(async file => {
            let status = fs.statSync("./commands/" + file);
            if (status.isDirectory()) {
                fs.readdir("./commands/" + file, async (err, subFiles) => {
                    if (err) throw(err);
                    subFiles.forEach(async subFile => {
                        let path = "./" + file + "/" + subFile;
                        RegisterCommand(client, path, subFile);
                    });
                });
            } else {
                let path = "./" + file;
                RegisterCommand(client, path, file);
            }
        });
    });

    client.on("message", (message) => {
        if (message.author.bot) return;
        let args = message.content.split(" ");
        if (args[0].indexOf(config.prefix) == -1) return;
        try {
            let command = args[0].replace(config.prefix, "").toLowerCase();
            let prop = client.commands.get(command);
            if (prop && prop.run) {
                // timeout check per guild
                if (!config.admins.includes(message.author.id)) {
                    if (timeouts[message.guild.id]) {
                        let embed = new MessageEmbed()
                            .setDescription("Give me some time to think 😧")
                            .setColor("#FFFF00");
                        message.channel.send({ embed });
                        return;
                    }
                    // timeout check per guild
                    if (!timeouts[message.guild.id]) timeouts[message.guild.id] = true;
                    setTimeout(() => {
                        delete timeouts[message.guild.id];
                    }, config.musicPlayer.timeBetweenCommands * 1000);
                }
                // main funzion trigger
                prop.run(client, args, message);
            } else {
                let embed = new MessageEmbed()
                    .setDescription("This command does not exists 😵")
                    .setColor("#FF0000");
                message.channel.send({ embed });
            }
        } catch (e) { console.error(e) }
    });

    client.on("messageReactionAdd", async (reactionMessage, user) => {
        try {
            if (reactionMessage.me) return;
            paths.forEach(async file => {
                let command = file.module;
                let prop = client.commands.get(command);
                if (prop && prop.reactionAdd) prop.reactionAdd(client, reactionMessage, user);
            });
        } catch (e) { console.error(e) }
    });

    client.on("guildMemberAdd", async (member) => {
        try {
            paths.forEach(async file => {
                let command = file.module;
                let prop = client.commands.get(command);
                if (prop && prop.memberJoin) prop.memberJoin(client, member);
            });
        } catch (e) { console.error(e) }
    });

    client.on('voiceStateUpdate', (oldState, newState) => {
        try {
            paths.forEach(async file => {
                let command = file.module;
                let prop = client.commands.get(command);
                if (prop && prop.userJoinChannel) prop.userJoinChannel(client, oldState, newState);
            });
        } catch (e) { console.error(e) }
    });

    client.on("guildCreate", (guild) => {
        global.con.query(`INSERT INTO servers(id) VALUES(${guild.id})`, (err, result) => {
            if (err) throw err;
            paths.forEach(async file => {
                let command = file.module;
                let prop = client.commands.get(command);
                if (prop && prop.botJoinedGuild) prop.botJoinedGuild(guild);
            });
        });
    });

    client.on("guildDelete", (guild) => {
        global.con.query(`DELETE FROM servers WHERE id = '${guild.id}'`, (err, result) => {
            if (err) throw err;
        })
    });

    let status = `Online on ${client.guilds.cache.size} servers | ${config.prefix}help`;
    if (client.guilds.cache.size == 1) { status = `Online on ${client.guilds.cache.size} server | ${config.prefix}help` }

    client.user.setPresence({ activity: { name: status }, status: 'dnd' });

    // if (config.status == "dev") return;
    // client.user.setAvatar(config.avatar)
    // client.user.setUsername(config.botName)
}
