const IPC = require("../");

const slave = new IPC();

setInterval(() => {
    slave.send("hello world!");
}, 1000);
