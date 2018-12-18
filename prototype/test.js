const { fork } = require("child_process");
const IPC = require("../");

const cp = fork("./child.js");
const master = new IPC(cp);

master.on("wahou", (message, next) => {
    console.log(message);
    next("yop from master!");
});
