// Require Third-party Dependencies
const uuid = require("uuid");
const SafeEmitter = require("@slimio/safe-emitter");

// SYMBOLS
const IPC_TYPE = Symbol("TYPE");

// CONSTANTS
const MESSAGE_TIMEOUT_MS = 1000;

/**
 * @class IPC
 *
 * @property {Boolean} isMaster
 */
class IPC extends SafeEmitter {
    /**
     * @constructor
     * @memberof IPC#
     * @param {ChildProcess} [cp] child processes
     *
     * @throws {Error}
     * @throws {TypeError}
     */
    constructor(cp) {
        super();
        const cpNotDefined = typeof cp === "undefined";
        if (cpNotDefined) {
            if (typeof process.send === "undefined") {
                throw new Error("Unable to declare slave IPC on master process!");
            }

            process.on("message", this._messageHandler.bind(this));
        }
        else {
            if (cp.constructor.name !== "ChildProcess") {
                throw new TypeError("cp must be instanceof ChildProcess");
            }

            this.cp = cp;
            this.cp.on("message", this._messageHandler.bind(this));
        }

        this.response = new SafeEmitter();
        this[IPC_TYPE] = cpNotDefined ? IPC.Types.Slave : IPC.Types.Master;
    }

    /**
     * @property {Boolean} isMaster
     * @memberof IPC#
     */
    get isMaster() {
        return this[IPC_TYPE] === IPC.Types.Master;
    }

    /**
     * @private
     * @method _messageHandler
     * @memberof IPC#
     * @param {*} data data
     * @returns {void}
     */
    _messageHandler(data) {
        const { headers: { subject = null, id } } = data;
        if (subject === null) {
            this.response.emit(id, data.message);
        }
        else {
            this.emit(subject, data.message, (message) => {
                this.nativeSend({ headers: { id }, message });
            });
        }
    }

    /**
     * @method nativeSend
     * @memberof IPC#
     * @param {T} data payload to send
     * @return {void}
     *
     * @template T
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
     * @method send
     * @memberof IPC#
     * @param {!String} subject subject name
     * @param {*} message message
     * @returns {Promise<T>}
     *
     * @template T
     * @throws {TypeError}
     */
    async send(subject, message) {
        if (typeof subject !== "string") {
            throw new TypeError("subject must be a string");
        }

        // Send message at the next event-loop iteration!
        const data = {
            headers: { subject, id: uuid() }, message
        };
        setImmediate(() => this.nativeSend(data));

        // Wait for response
        const [result] = await this.response.once(data.headers.id, MESSAGE_TIMEOUT_MS);

        return result;
    }
}

IPC.Types = Object.freeze({
    Master: 0,
    Slave: 1
});

module.exports = IPC;
