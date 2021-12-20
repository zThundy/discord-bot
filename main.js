import Discord from "discord.js";
import { init } from "./commands/init.js";
import config from "./config.js";
// custom classes import
import SQL from "./classes/sqlite.js";
import Colors from "./classes/colors.js";
import Player from "./classes/player.js";
import Lyrics from "./classes/lyrics.js";

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
    client.player = new Player(client);
    init(client, config);
});

client.on('shardError', error => {
	console.error(colors.changeBackground("red", "Error on connecting to discord: " + error));
});

client.on('unhandledRejection', error => {
	console.error(colors.changeBackground("red", "Error on connecting to discord: " + error));
});