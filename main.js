import Discord from "discord.js";
import mysql from "mysql";
import { init } from "./commands/init.js"
import config from "./config.js"

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.login(config.token);

var con = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    database: config.database.database,
    password: config.database.password
});

con.connect(err => {
    if (err) console.log(err);
    console.log("Connessione al database stabilita!");
});

con.on("error", err => {
    if (err) console.log(err);
    con = mysql.createConnection({
        host: config.database.host,
        user: config.database.user,
        database: config.database.database,
        password: config.database.password
    });
    global.con = con;
})

global.con = con;

client.on("ready", () => {
    console.log("Bot ready :)");
    init(client, config)
});