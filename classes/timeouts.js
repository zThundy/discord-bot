import { MakeID } from "./utils.js";

class Timeouts {
    constructor() {
        this.timeouts = [];
    }

    addTimeout(id, time, start, end) {
        let _id = id || MakeID(10);
        let _time = isNaN(Number(time)) ? 5000 : Number(time);
        let _start, _end;

        if (typeof start === "function") _start = start;
        if (typeof end === "function") _end = end;

        let position = this.timeouts.push({ id: _id, time: _time, start: _start, end: _end });
        setTimeout(() => { this.__end(this.hasTimeout(_id), position) }, _time);
        this._start(id);

        return _id;
    }

    __end(timeout, position) {
        if (timeout && timeout.end) {
            timeout.end()
            delete timeout[position];
        }
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