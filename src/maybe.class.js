// Require Internal Dependencies
const Stream = require("./stream.class");

// Symbols
const innerValue = Symbol("MaybeValue");

/**
 * @class MaybeStream
 * @classdesc Detect whatever a value is an IPC.Stream or not
 */
class MaybeStream {
    /**
     * @constructor
     * @param {any} value any
     */
    constructor(value) {
        Reflect.defineProperty(this, innerValue, {
            value,
            enumerable: false,
            configurable: false
        });
    }

    /**
     * @async
     * @generator
     * @method getValue
     * @param {Object} options options
     * @param {Boolean} [options.decode] decode stream
     * @returns {Promise<any>}
     */
    async getValue({ decode = true } = Object.create(null)) {
        const value = this[innerValue];
        if (value instanceof Stream) {
            const bufArr = [];
            for await (const buf of value) {
                bufArr.push(buf);
            }
            const concatBuf = Buffer.concat(bufArr);

            return decode ? concatBuf.toString() : concatBuf;
        }

        return decode && Buffer.isBuffer(value) ? value.toString() : value;
    }
}

module.exports = MaybeStream;
