// Require Internal Dependencies
const Stream = require("./stream.class");

// Require Third-party Dependencies
const is = require("@slimio/is");

// Symbols
const innerValue = Symbol("MaybeValue");

/**
 * @class MaybeStream
 * @classdesc Detect whatever a value is an IPC.Stream or not
 */
class MaybeStream {
    /**
     * @constructor
     * @memberof MaybeStream#
     * @param {any} value any javascript value
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
     * @method getValue
     * @desc Get the transformed value (without Stream wrapper)
     * @memberof MaybeStream#
     * @param {Object} options options
     * @param {Boolean} [options.decode=true] decode stream
     * @returns {Promise<any>}
     */
    async getValue({ decode = true } = Object.create(null)) {
        const value = this[innerValue];
        if (value instanceof Stream && is.asyncIterable(value)) {
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
