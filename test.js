const { fork } = require("child_process");
const IPC = require("./");

const cp = fork("./test/child.js");
const master = new IPC(cp);
