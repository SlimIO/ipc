const { fork } = require("child_process");
const IPC = require("../");

/**
 * @typedef ChildCom
 * @property {String} wahou
 */

const cp = fork("./child.js");

/** @type {IPC<ChildCom>} */
const master = new IPC(cp);

master.on("wahou", async(message, next) => {
    try {
        for await (const buf of message) {
            console.log(buf.toString());
        }
    }
    catch (err) {
        console.error(err);
    }
    next("yop from master!");
});
