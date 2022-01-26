import fs from "fs";
import config from "./../config.js";

export function FormatNumber(value) {
    var newValue = value;
    if (value >= 1000) {
        var suffixes = ["", "k", "m", "b","t"];
        var suffixNum = Math.floor(("" + value).length / 3);
        var shortValue = '';
        for (var precision = 1; precision >= 1; precision--) {
            shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-z A-Z 0-9]+/g,'');
            if (dotLessShortValue.length <= 1) { break; }
        }
        if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
        newValue = shortValue + suffixes[suffixNum];
    }
    return newValue;
}

export function log(message) {
    if (!config.enableLogs) return;
    fs.readFile("log.txt", 'utf8', (err, data) => {
        var currentdate = new Date();
        var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1)  + "/"
                + currentdate.getFullYear() + " | "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds() + " @"
        message = datetime + " " + message
        data = data + "\n" + message
        console.log(message)

        fs.writeFile("log.txt", data, (err) => {
            if (err) throw err;
        })
    })
}

export function FormatToMysql(time) {
    return new Date(time).toJSON().slice(0, 19).replace('T', ' ')
}

export function IsSpotifyPlaylist(url) {
    if (url.includes("/playlist/")) return true;
    return false;
}

export function MakeID(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));
    return result;
}