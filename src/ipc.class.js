"use strict";

// Require Node.js Dependencies
const { randomBytes } = require("crypto");

// Require Third-party Dependencies
const SafeEmitter = require("@slimio/safe-emitter");
const uuid = require("uuid/v4");

// Require Internal Dependencies
const MaybeStream = require("./maybe.class");
const Stream = require("./stream.class");

// SYMBOLS
const IPC_TYPE = Symbol("TYPE");

/**
 * @class IPC
 * @augments SafeEmitter
 *
 * @property {boolean} isMaster
 * @property {Map<string, IPC.Stream>} mem
 * @property {SafeEmitter} response
 */
class IPC extends SafeEmitter {
    /**
     * @class
     * @memberof IPC#
     * @param {ChildProcess} [cp] child processes
     *
     * @throws {Error}
     * @throws {TypeError}
     */
    constructor(cp) {
        super();
        /* istanbul ignore next */
        this.catch((error) => console.error(error));
        this.response = new SafeEmitter();
        /** @type {Map<string, IPC.Stream>} */
        this.mem = new Map();

        if (typeof cp === "undefined") {
            if (typeof process.send === "undefined") {
                throw new Error("Unable to declare slave IPC on master process!");
            }

            process.on("message", this._messageHandler.bind(this));
            this[IPC_TYPE] = IPC.Types.Slave;
        }
        else {
            if (cp.constructor.name !== "ChildProcess") {
                throw new TypeError("cp must be instanceof ChildProcess");
            }

            this.cp = cp;
            this.cp.on("message", this._messageHandler.bind(this));
            this[IPC_TYPE] = IPC.Types.Master;
        }
    }

    /**
     * @property {boolean} isMaster
     * @description Known if the current process is the master or the slave
     * @memberof IPC#
     * @returns {!boolean}
     */
    get isMaster() {
        return this[IPC_TYPE] === IPC.Types.Master;
    }

    /**
     * @private
     * @function _responseHandler
     * @memberof IPC#
     * @param {string} id id
     * @param {string} message message
     * @returns {Promise<void>}
     */
    async _responseHandler(id, message) {
        if (message instanceof Stream) {
            this.nativeSend({ headers: { id, ws: true } });
            for await (const buf of message) {
                this.nativeSend({ headers: { id }, message: [...buf.values()] });
            }
            this.nativeSend({ headers: { id, ws: false } });

            return;
        }

        this.nativeSend({ headers: { id }, message });
    }

    /**
     * @private
     * @function _messageHandler
     * @memberof IPC#
     * @param {any} data data
     * @returns {void}
     */
    _messageHandler(data) {
        const { subject = null, id, ws = null } = data.headers;

        if (ws !== null) {
            if (ws) {
                const wS = new IPC.Stream();
                this.mem.set(id, wS);

                if (subject === null) {
                    this.response.emit(id, wS);
                }
                else {
                    this.emit(subject, wS, async(data) => {
                        await this._responseHandler(id, data);
                    });
                }
            }
            else {
                const wS = this.mem.get(id);
                wS.end();

                this.mem.delete(id);
            }

            return;
        }

        // If id match a saved memory (write message to the stream)
        if (this.mem.has(id)) {
            const wS = this.mem.get(id);
            wS.write(Buffer.from(data.message));

            return;
        }

        if (subject === null) {
            this.response.emit(id, data.message);
        }
        else {
            this.emit(subject, data.message, async(data) => {
                await this._responseHandler(id, data);
            });
        }
    }

    /**
     * @function nativeSend
     * @memberof IPC#
     * @param {any} data payload to send
     * @returns {void}
     */
    nativeSend(data) {
        if (this.isMaster) {
            this.cp.send(data);
        }
        else {
            process.send(data);
        }
    }

    /**
     * @function send
     * @description Send a message to distant process
     * @memberof IPC#
     * @param {!string} subject subject name
     * @param {Stream | any} message message
     * @returns {Promise<any>}
     *
     * @throws {TypeError}
     */
    async send(subject, message) {
        if (typeof subject !== "string") {
            throw new TypeError("subject must be a string");
        }

        let timeOutMS = IPC.MESSAGE_TIMEOUT_MS;
        const id = uuid();
        if (message instanceof Stream) {
            if (message.timeOut !== null) {
                timeOutMS = message.timeOut;
            }

            this.nativeSend({ headers: { subject, id, ws: true } });
            for await (const buf of message) {
                this.nativeSend({ headers: { subject, id }, message: [...buf.values()] });
            }
            this.nativeSend({ headers: { subject, id, ws: false } });
        }
        else {
            const data = {
                headers: { subject, id }, message
            };
            setImmediate(() => this.nativeSend(data));
        }

        // Wait for response
        const [result] = await this.response.once(id, timeOutMS);

        return result;
    }
}

IPC.MESSAGE_TIMEOUT_MS = 1000;
IPC.Stream = Stream;
IPC.MaybeStream = MaybeStream;
IPC.Types = Object.freeze({
    Master: 0,
    Slave: 1
});
Object.preventExtensions(IPC);

module.exports = IPC;
