import Discord from "discord.js";
import mysql from "mysql";
import { init } from "./commands/init.js"
import config from "./config.js"

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.login(config.token);

const con = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    database: config.database.database,
    password: config.database.password
})

con.connect(err => {
    if (err) console.log(err);
    console.log("Connessione al database stabilita!");
})

setInterval(keepAlive, 600000);
function keepAlive() {
    con.query('SELECT 1');
    console.log("Fired Keep-Alive");
    return;
}

con.on("error", err => {
    if (err) console.log(err);
})

global.con = con;

client.on("ready", () => {
    console.log("sono pronto e ascolto le tue cazzate");
    init(client, config)
});