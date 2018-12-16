// Require Third-party Dependencies
const is = require("@slimio/is");
const uuid = require("uuid");

// SYMBOLS
const IPC_TYPE = Symbol("TYPE");

/**
 * @class IPC
 *
 * @property {Boolean} isMaster
 */
class IPC {
    /**
     * @constructor
     * @memberof IPC#
     * @param {ChildProcess} [cp] child processes
     *
     * @throws {Error}
     * @throws {TypeError}
     */
    constructor(cp) {
        const cpNotDefined = typeof cp === "undefined";
        if (cpNotDefined) {
            if (typeof process.send === "undefined") {
                throw new Error("Unable to declare slave IPC on master process!");
            }

            process.on("message", (msg) => {
                console.log(msg);
            });
        }
        else {
            if (cp.constructor.name !== "ChildProcess") {
                throw new TypeError("cp must be instanceof ChildProcess");
            }

            this.cp = cp;
            this.cp.on("message", (msg) => {
                console.log(msg);
            });
        }

        Reflect.defineProperty(this, IPC_TYPE, {
            value: cpNotDefined ? IPC.Types.Slave : IPC.Types.Master,
            enumerable: false,
            writable: false,
            configurable: false
        });
    }

    /**
     * @property {Boolean} isMaster
     * @memberof IPC#
     */
    get isMaster() {
        return this[IPC_TYPE] === IPC.Types.Master;
    }

    /**
     * @method send
     * @memberof IPC#
     * @param {*} message message
     * @returns {Promise<void>}
     */
    async send(message) {
        const msgStr = is.string(message) ? message : JSON.stringify(message);
        const id = uuid();
        const msg = {
            headers: { id },
            payload: msgStr
        };

        if (this.isMaster) {
            this.cp.send(JSON.stringify(msg));
        }
        else {
            process.send(JSON.stringify(msg));
        }
    }
}

IPC.Types = Object.freeze({
    Master: 0,
    Slave: 1
});

module.exports = IPC;
