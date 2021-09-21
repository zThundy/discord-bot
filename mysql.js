import mysql from "mysql";
import Colors from "./colors.js";
const colors = new Colors();

class MySQLClass {
    constructor(config) {
        this.connectionConfig = {
            host: config.host,
            user: config.user,
            database: config.database,
            password: config.password
        }
        this.connect()
    }

    connect() {
        this.connection = mysql.createConnection(this.connectionConfig)
        this.createHandlers()
    }

    createHandlers() {
        if (!this.connection) return console.error(colors.changeColor("red", "Error on creating handlers. No connection to db"));
        this.connection.connect(err => {
            if (err) {
                console.error(colors.changeColor("red", "Got error on connecting to database: " + err));
                console.log(colors.changeColor("yellow", "Retrying connection in 5 seconds..."));
                setTimeout(() => { this.connect(); }, 5000);
            } else {
                console.log(colors.changeColor("green", "Connection to database enstablished successfully"));
            }
        });
        this.connection.on("err", (err) => {
            if (err) console.error(colors.changeColor("red", "Got error while connected to database: " + err));
            console.log(colors.changeColor("yellow", "Retrying connection in 5 seconds..."));
            setTimeout(() => { this.connect(); }, 5000);
        })
    }

    getConnection() {
        if (this.connection) return this.connection;
        console.error(colors.changeColor("red", "Error retriving connection. Try and reconnect to database"));
    }
}

export default MySQLClass;