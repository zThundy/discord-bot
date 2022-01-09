import { MakeID } from "./utils.js";
import Colors from "./colors.js";
import config from "../config.js";
const colors = new Colors();

class Timeouts {
    constructor() {
        this.timeouts = [];
    }

    addTimeout(id, time, start, end) {
        if (config.admins.includes(message.author.id)) return;
        let _id = id || MakeID(10);
        let _time = isNaN(Number(time)) ? 5000 : Number(time * 1000);
        let _start, _end;

        if (typeof start === "function") _start = start;
        if (typeof end === "function") _end = end;

        let position = this.timeouts.push({ id: _id, time: _time, start: _start, end: _end });
        setTimeout(() => { this.__end(this.hasTimeout(_id), position) }, _time);
        if (_start) _start(id);

        console.log(colors.changeColor("blue", `Added timeout of ${_time} ms with id ${_id}`));

        return _id;
    }

    __end(timeout, position) {
        console.log(colors.changeColor("blue", `Removed timeout of ${timeout.time} ms with id ${timeout.id}`));
        if (timeout && timeout.end) timeout.end();
        this.timeouts.shift();
    }

    hasTimeout(id) {
        id = String(id);
        for (var i in this.timeouts) {
            var _id = String(this.timeouts[i].id);
            if (_id === id) return this.timeouts[i];
        }
        return false;
    }
}

export default Timeouts;