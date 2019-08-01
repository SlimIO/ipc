"use strict";

// Require Node.js Dependencies
const { Transform } = require("stream");

/**
 * @class Stream
 * @classdesc Implement custom Transform Stream for our ipc mechanism
 * @augments Transform
 *
 * @property {NodeJS.Timer} timeOut
 */
class Stream extends Transform {
    /**
     * @class
     * @memberof Stream#
     */
    constructor() {
        super();
        this.timeOut = null;
    }

    // eslint-disable-next-line
    _read() {
        // do nothing
    }

    /**
     * @function _write
     * @param {!Buffer} chunk buffer chunk!
     * @param {*} enc encoding
     * @param {*} next next
     * @returns {void}
     */
    _write(chunk, enc, next) {
        this.push(chunk);
        next();
    }
}

module.exports = Stream;
