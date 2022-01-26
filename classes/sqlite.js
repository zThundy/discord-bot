import sqlite3 from "sqlite3";
import Colors from "./colors.js";
const colors = new Colors();

class SQL {
    queryRetryes = 5;
    retryTimeout = 1000;

    constructor() {
        this._init();
        this._createHandlers();
    }

    _init() {
        console.log(colors.changeColor("yellow", "Initializing SQLITE3 database"));
        this.db = new sqlite3.Database("./database.db");
        this.db.run("CREATE TABLE IF NOT EXISTS servers (id TEXT)");
        this.db.run("CREATE TABLE IF NOT EXISTS songs (guild VARCHAR, id VARCHAR, data TEXT)");
    }

    _createHandlers() {
        console.log(colors.changeColor("green", "Creating DB handlers"));
        this.db.on("error", err => {
            console.error(err);
        });
    }

    execute(query, args, cb, id = 0) {
        this.db.run(query, args, (err, r) => {
            if (err) return this.handleErrors(id, err, "execute", query, args, cb);
            if (cb) cb(r);
        })
    }

    get(query, args, cb, id = 0) {
        this.db.all(query, args, (err, r) => {
            if (err) return this.handleErrors(id, err, "get", query, args, cb);
            if (cb) cb(r);
        })
    }

    handleErrors(id, err, type, query, args, cb) {
        console.error(colors.changeColor("red", "Query " + query + " generated an exeption"))
        console.error(colors.changeColor("red", "The db generated an exeption. " + err));
        console.error(colors.changeColor("red",  "Retry number " + id));
        this._init();
        if (id < this.queryRetryes) {
            setTimeout(() => { this[type](query, args, cb, Number(id + 1)); }, this.retryTimeout);
        }
    }
}

export default SQL;