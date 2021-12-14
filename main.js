import Discord from "discord.js";
import Colors from "./colors.js";
import { init } from "./commands/init.js";
import config from "./config.js";
import SQL from "./sqlite.js";
import Lyrics from "./lyrics.js";

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.login(config.token);

const database = new SQL();
const colors = new Colors();
const lyrics = new Lyrics(config.lyrics);

client.on("ready", () => {
    console.log(colors.changeBackground("green", "Bot authed successfully :)"));
    client.database = database;
    client.lyrics = lyrics;
    init(client, config);
});

client.on('shardError', error => {
	console.error(colors.changeBackground("red", "Error on connecting to discord: " + error));
});

client.on('unhandledRejection', error => {
	console.error(colors.changeBackground("red", "Error on connecting to discord: " + error));
});