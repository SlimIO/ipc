const IPC = require("../");

/**
 * @typedef ChildCom
 * @property {String} wahou
 */

/** @type {IPC<ChildCom>} */
const slave = new IPC();

setInterval(async() => {
    const wS = new IPC.Stream();
    slave.send("wahou", wS);
    setTimeout(() => {
        wS.write("hello world!");
    }, 100);
    setTimeout(() => {
        wS.write("foo bar!");
        wS.end();
    }, 200);
}, 1000);
