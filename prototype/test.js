const { fork } = require("child_process");
const IPC = require("../");

/**
 * @typedef ChildCom
 * @property {String} wahou
 */

const cp = fork("./child.js");

/** @type {IPC<ChildCom>} */
const master = new IPC(cp);

master.on("wahou", (message, next) => {
    console.log(message);
    next("yop from master!");
});
