const IPC = require("../");

/**
 * @typedef ChildCom
 * @property {String} wahou
 */

/** @type {IPC<ChildCom>} */
const slave = new IPC();

setInterval(async() => {
    const wS = new IPC.Stream();
    setImmediate(() => {
        setTimeout(() => {
            wS.write("hello world!");
        }, 50);
        setTimeout(() => {
            wS.write("foo bar!");
            wS.end();
        }, 100);
    });
    const masterMsg = await slave.send("wahou", wS);
    console.log(masterMsg);
}, 1000);
