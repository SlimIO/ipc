const { fork } = require("child_process");
const IPC = require("../");

/**
 * @typedef ChildCom
 * @property {String} wahou
 */

const cp = fork("./child.js");

/** @type {IPC<ChildCom>} */
const master = new IPC(cp);

master.on("wahou", async(data, next) => {
    const value = await (new IPC.MaybeStream(data)).getValue();
    console.log(value);

    next("yop from master!");
});
