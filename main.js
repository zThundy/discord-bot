import Discord from "discord.js";
import { _init } from "./commands/init.js";
import config from "./config.js";
// custom classes import
import SQL from "./classes/sqlite.js";
import Colors from "./classes/colors.js";
import Player from "./classes/player.js";
import Lyrics from "./classes/lyrics.js";
import Timeouts from "./classes/timeouts.js";
// import Interactions from "./interactions/init.js";

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.login(config.token);

const colors = new Colors();

client.on("ready", () => {
    client.database = new SQL();
    client.lyrics = new Lyrics(config.lyrics);
    client.player = new Player(client);
    client.timeouts = new Timeouts();
    // client.Interactions = new Interactions(client);
    client.config = config;
    console.log(colors.changeBackground("green", "Bot authed successfully :)"));
    _init(client);
});

client.on('shardError', error => {
    console.error(colors.changeBackground("red", "Error on connecting to discord: " + error));
});

client.on('unhandledRejection', error => {
    console.error(colors.changeBackground("red", "Error on connecting to discord: " + error));
});