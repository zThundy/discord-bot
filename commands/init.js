import fs from "fs";
import { MessageEmbed } from "discord.js"

let paths = [];

export function GetCommands() { return paths; }

export function UnregisterCommand(client, path, command) {
    paths = paths.filter(filterPath => filterPath.path !== path);
    client.commands = client.commands.filter((_, _command) => { return _command !== command });
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
    fs.readdir("./commands/", (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            let status = fs.statSync("./commands/" + file);
            if (status.isDirectory()) {
                fs.readdir("./commands/" + file, (err, subFiles) => {
                    if (err) return console.error(err);
                    subFiles.forEach(subFile => {
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
        // update player message every time a message is fired
        client.player.update(client, message);
        try {
            let command = args[0].replace(config.prefix, "").toLowerCase();
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
                client.timeouts.addTimeout(message.author.id, config.timeouts.timeBetweenCommands);
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
        client.database.execute(`INSERT INTO servers(id) VALUES(${guild.id})`, () => {
            paths.forEach(file => {
                let command = file.module;
                let prop = client.commands.get(command);
                if (prop && prop.botJoinedGuild) prop.botJoinedGuild(guild);
            });
        });
    });

    client.on("guildDelete", (guild) => {
        client.database.execute(`DELETE FROM servers WHERE id = '${guild.id}'`)
    });

    let status = `Online on ${client.guilds.cache.size} servers | ${config.prefix}help`;
    if (client.guilds.cache.size == 1) status = `Online on ${client.guilds.cache.size} server | ${config.prefix}help`;

    client.user.setPresence({ activity: { name: status }, status: 'dnd' });
}
