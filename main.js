import Discord from "discord.js";
import MySQL from "./mysql.js";
import Colors from "./colors.js";
import { init } from "./commands/init.js";
import config from "./config.js";

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.login(config.token);

const mysql = new MySQL(config.database);
global.con = mysql.getConnection();

const colors = new Colors();

client.on("ready", () => {
    console.log(colors.changeBackground("green", "Bot authed successfully :)"));
    init(client, config);
});

client.on('shardError', (error) => {
	console.error(colors.changeBackground("red", "Error on connecting to discord: " + error));
});

client.on('unhandledRejection', error => {
	console.error(colors.changeBackground("red", "Error on connecting to discord: " + error));
});