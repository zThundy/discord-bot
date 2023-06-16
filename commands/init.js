import fs from "fs";
import { MessageEmbed } from "discord.js";
import Colors from "../classes/colors.js";
const colors = new Colors();

let paths = [];

export function GetCommands() { return paths; }
export function GetCommand(command) { return paths.filter(path => path.module == command) }

export function UnregisterCommand(client, path, command) {
    paths = paths.filter(filterPath => filterPath.path !== path);
    client.commands = client.commands.filter((_, _command) => { return _command !== command });
}

export async function RegisterCommand(client, path, file) {
    console.log(colors.changeColor("yellow", "[Info] Trying to load command " + file));
    if (!file.endsWith(".js")) return;
    let props = await import(path);
    if (!props.init && !props.run) return;
    paths.push({ path: path, module: file.split(".")[0] });
    console.log(colors.changeColor("green", "[Info] Command " + file + " loaded"));
    client.commands.set(file.split(".")[0], props);
    if (props.init) props.init(client);
}

export async function _init(client) {
    fs.readdir("./commands/", (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            let current = fs.statSync("./commands/" + file);
            if (current.isDirectory()) {
                fs.readdir("./commands/" + file, (err, subFiles) => {
                    if (err) return console.error(err);
                    subFiles.forEach(subFile => {
                        RegisterCommand(client, "./" + file + "/" + subFile, subFile);
                    });
                });
            } else {
                RegisterCommand(client, "./" + file, file);
            }
        });
        _initClient(client);
    });
}

const _initClient = (client) => {
    console.log(colors.changeColor("yellow", "[Info] Initializing discord client handlers..."));
    client.on("message", (message) => {
        if (message.author.bot) return;
        // split the message into an array of words
        let args = message.content.split(" ");
        // check if the first argument is a command
        if (args[0].indexOf(client.config.prefix) == -1) return;
        // check if the command starts with the prefix
        if (!args[0].startsWith(client.config.prefix)) return;
        // update player message every time a message is fired
        client.player.update(client, message);
        try {
            let command = args[0].replace(client.config.prefix, "").toLowerCase();
            let prop = client.commands.get(command);
            if (prop && prop.run) {
                // use the custom class made for checking timeouts
                // to create or check timeout for a specific user
                let timeout = client.timeouts.hasTimeout(message.author.id);
                if (timeout) {
                    let embed = new MessageEmbed()
                        .setDescription("Give me some time to think 😧")
                        .setColor("#FFFF00");
                    message.channel.send({ embed });
                    return;
                }
                // add timeout for the user
                client.timeouts.addTimeout(message.author.id, client.config.timeouts.timeBetweenCommands);
                // main function call
                prop.run(client, args, message);
            } else {
                let embed = new MessageEmbed()
                    .setDescription("This command does not exists 😵")
                    .setColor("#FF0000");
                message.channel.send({ embed });
            }
        } catch (e) { console.error(e) }
    });

    client.on("messageReactionAdd", (reactionMessage, user) => {
        try {
            if (reactionMessage.me) return;
            paths.forEach(file => {
                let command = file.module;
                let prop = client.commands.get(command);
                if (prop && prop.reactionAdd) prop.reactionAdd(client, reactionMessage, user);
            });
        } catch (e) { console.error(e) }
    });

    client.on("messageReactionRemove", (reactionMessage, user) => {
        try {
            if (reactionMessage.me) return;
            paths.forEach(file => {
                let command = file.module;
                let prop = client.commands.get(command);
                if (prop && prop.reactionRemove) prop.reactionRemove(client, reactionMessage, user);
            });
        } catch (e) { console.error(e) }
    });

    client.on("guildMemberAdd", (member) => {
        try {
            paths.forEach(file => {
                let command = file.module;
                let prop = client.commands.get(command);
                if (prop && prop.memberJoin) prop.memberJoin(client, member);
            });
        } catch (e) { console.error(e) }
    });

    client.on('voiceStateUpdate', (oldState, newState) => {
        try {
            paths.forEach(file => {
                let command = file.module;
                let prop = client.commands.get(command);
                if (prop && prop.voiceUpdate) prop.voiceUpdate(client, oldState, newState);
            });
        } catch (e) { console.error(e) }
    });

    client.on("guildCreate", (guild) => {
        console.log(colors.changeColor("green", `Added in guild "${guild.name}"`))
        client.database.execute(`INSERT INTO servers(id, name) VALUES(${guild.id}, '${guild.name}')`, {}, () => {
            paths.forEach(file => {
                let command = file.module;
                let prop = client.commands.get(command);
                if (prop && prop.botJoinedGuild) prop.botJoinedGuild(guild);
            });
        });
        
        if (client.config.guildWhitelist.enabled) {
            if (!client.config.guildWhitelist.guilds.includes(guild.id)) {
                guild.leave();
                client.database.execute("DELETE FROM servers WHERE id = ?", [guild.id]);
            }
        }
        _updateStatus(client);
    });

    client.on("guildDelete", (guild) => {
        console.log(colors.changeColor("red", `Removed from guild "${guild.name}"`))
        client.database.execute(`DELETE FROM servers WHERE id = '${guild.id}'`)
        _updateStatus(client);
    });
    
    client.guilds.cache.forEach(guild => {
        client.database.get("SELECT * FROM servers WHERE id = ?", [guild.id], r => {
            if (!r[0]) {
                client.database.execute("INSERT INTO servers(id, name) VALUES(?, ?)", [guild.id, guild.name]);
            }
        });
        if (client.config.guildWhitelist.enabled) {
            if (!client.config.guildWhitelist.guilds.includes(guild.id)) {
                guild.leave();
                client.database.execute("DELETE FROM servers WHERE id = ?", [guild.id]);
            }
        }
    });

    console.log(colors.changeColor("green", "[Info] Discord client handlers initialized"));
    _updateStatus(client);
}

const _updateStatus = (client) => {
    var discordStatus = `Online on ${client.guilds.cache.size} servers | ${client.config.prefix}help`;
    if (client.guilds.cache.size == 1) discordStatus = `Online on ${client.guilds.cache.size} server | ${client.config.prefix}help`;
    console.log(colors.changeColor("magenta", `Changing current status to "${discordStatus}"`))
    client.user.setPresence({ activity: { name: discordStatus }, status: 'dnd' });
}